import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import Server, { UserServersData, UserServersDataQueryResult } from './models/server.model';
import User from './models/user.model';
import Member from './models/member.model';
import Group from './models/group.model';
import { ChannelType, TextChannel, VoiceChannel } from './models/channel.model';
import Message from './models/message.model';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';
import { Client as Minio } from 'minio';
import md5 from './util/md5';

@Injectable()
export class AppService {

  private readonly minioClient: Minio;

  constructor(
    private connection: Connection,
    @InjectRepository(ChannelEntity)
    private channelRepository: Repository<ChannelEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
  ) {
    this.minioClient = new Minio({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    this.minioClient.bucketExists('images').then((exists) =>
      exists || this.minioClient.makeBucket('images', 'us-east-1') as any,
    );
  }

  private _tokens: string[] = [];

  get tokens(): string[] {
    return this._tokens;
  }

  removeToken(token: string) {
    this._tokens.splice(this._tokens.indexOf(token), 1);
  }

  private static processQuery(
    result: UserServersDataQueryResult,
  ): UserServersData {

    const serversTable: Server[] = result[0].map((server: Omit<Server, 'channels' | 'groups' | 'members'>) => ({
      ...server,
      channels: [],
      groups: [],
      members: [],
    }));

    const usersTable: User[] = [];

    result[3].forEach((member: Member) => {
      const server = serversTable.find(server => server.id === member.serverId);
      if (server === undefined) return;
      if (server.members.findIndex(m1 => m1.id === member.id) === -1)
        server.members.push({
          id: member.id,
          userId: member.userId,
          serverId: member.serverId,
        });

    });

    result[4].forEach((user: UserEntity) => {
      const existingUserIndex = usersTable.findIndex(usr => usr.id === user.ID);
      if (existingUserIndex === -1)
        usersTable.push({
          id: user.ID,
          username: user.USERNAME,
          firstName: user.FIRST_NAME,
          lastName: user.LAST_NAME,
        });
    });

    result[1].forEach((group: Omit<Group, 'channels'>) => {
      const server = serversTable.find(server => server.id === group.serverId);
      if (server === undefined) return;
      server.groups.push({ ...group, channels: [] });
    });

    result[2].forEach((channel: TextChannel | VoiceChannel) => {
      if (channel.type === ChannelType.Text) {
        (channel as TextChannel).messages = [];
      }
      const server = serversTable.find(server => server.id === channel.serverId);
      if (channel.groupId === null)
        server.channels.push(channel);
      else {
        const group = server.groups.find(group => group.id === channel.groupId);
        if (group === undefined) return;
        group.channels.push(channel);
      }
    });


    return {
      servers: serversTable,
      users: usersTable,
    };
  }

  addToken(token: string) {
    this._tokens.push(token);
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {
    return this.connection
      .query('SELECT create_invitation(?,?)', [userId, serverId])
      .then((result) => Object.entries(result[0])[0][1] as string);
  }

  async createGroup(
    userId: string,
    serverId: number,
    name: string,
  ): Promise<number> {
    return this.connection
      .query('SELECT create_group(?,?,?)', [userId, serverId, name])
      .then((result) => Object.entries(result[0])[0][1] as number);
  }

  async createChannel(
    userId: string,
    serverId: number,
    groupId: number | null,
    type: ChannelType,
    name: string,
  ): Promise<number> {
    return this.connection
      .query('SELECT create_channel(?,?,?,?,?)', [
        userId,
        serverId,
        groupId,
        type,
        name,
      ])
      .then((result) => Object.entries(result[0])[0][1] as number);
  }

  async moveChannel(userId: string, payload: any) {
    await this.channelRepository.update(payload.channelId, { order: payload.order, group_id: payload.groupId });
  }

  async sendMessage(
    userId: string,
    channelId: number,
    message: string,
    isReply: boolean,
    replyId: number | null,
    image: string | null,
  ): Promise<Message> {
    // console.log(image);
    let imageMd5;
    if (image !== null) {
      imageMd5 = await this.putImage(image);
    }
    const result = await this.connection.query('CALL send_message(?,?,?,?,?,?)', [
      userId,
      channelId,
      message,
      isReply,
      replyId,
      image === null ? null : imageMd5,
    ]);
    return result[0][0];
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query('CALL create_server(?,?)', [
      userId,
      name,
    ]);

    await this.addUsersDetailsToResult(result);

    return AppService.processQuery(result);
  }

  async getUserData(userId: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL get_user_data(?)',
      [userId],
    );

    await this.addUsersDetailsToResult(result);

    return AppService.processQuery(result);
  }

  async getMessages(
    userId: string,
    serverId: number,
    channelId: number,
    offset: number,
  ): Promise<Omit<Message, 'imageMd5'> & { image: string | null }[]> {
    const result = await this.connection.query('CALL get_messages(?,?,?,?)', [
      userId,
      serverId,
      channelId,
      offset,
    ]);
    const messages = result[0].map((message) => {
      message.image = message.imageMd5;
      delete message.imageMd5;
      return message;
    });
    const promises = [];
    messages.forEach(message => {
      if (message.image === null) return;
      promises.push(this.getImage(message.image).then(data => {
        message.image = data;
      }));
    });
    await Promise.all(promises);
    return messages;
  }

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL join_server(?,?)',
      [userId, invitation],
    );
    await this.addUsersDetailsToResult(result);
    return AppService.processQuery(result);
  }

  editMessage(userId: string, messageId: number, text: string) {
    return this.messageRepository.update(messageId, { text });
  }

  deleteMessage(userId: string, messageId: number) {
    return this.messageRepository.delete(messageId);
  }

  private async putImage(image: string) {
    const imageMd5 = md5(image);
    return this.minioClient.putObject('images', imageMd5, image).then(() => imageMd5);
  }

  private async getImage(md5: string) {
    const dataStream = await this.minioClient.getObject('images', md5);
    return new Promise((resolve, reject) => {
      let data = '';
      dataStream.on('readable', () => {
        let chunk;
        while (null !== (chunk = dataStream.read())) {
          data += chunk;
        }
      });
      dataStream.on('end', () => {
        resolve(data);
      });
      dataStream.on('error', err => {
        reject(err);
      });

    });
  }

  private async addUsersDetailsToResult(result: UserServersDataQueryResult) {
    const usersIds = result[3].map(member => ({ ID: member.userId })).filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.keycloakRepository.find({
      select: ['ID', 'USERNAME', 'FIRST_NAME', 'LAST_NAME'],
      where: usersIds,
    });
  }
}
