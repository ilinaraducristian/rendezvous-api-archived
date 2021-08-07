import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import Server, { UserServersData, UserServersDataQueryResult } from './models/server.model';
import User from './models/user.model';
import Member from './models/member.model';
import Group from './models/group.model';
import Channel, { ChannelType } from './models/channel.model';
import Message from './models/message.model';

@Injectable()
export class AppService {
  constructor(
    private connection: Connection,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
  ) {
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

    result[2].forEach((channel: Channel) => {
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

  async moveChannel(
    userId: string,
    serverId: number,
    groupId: number | null,
    channelId: number,
    channelOrder: number,
  ): Promise<boolean> {
    await this.connection.query('CALL move_channel(?,?,?,?,?)', [
      userId,
      serverId,
      groupId,
      channelId,
      channelOrder,
    ]);
    return true;
  }

  async sendMessage(
    userId: string,
    channelId: number,
    message: string,
  ): Promise<Message> {
    const result = await this.connection.query('CALL send_message(?,?,?)', [
      userId,
      channelId,
      message,
    ]);
    return result[0][0];
  }

  async createServer(uid: string, name: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query('CALL create_server(?,?)', [
      uid,
      name,
    ]);

    await this.addUsersDetailsToResult(result);

    return AppService.processQuery(result);
  }

  async getUserServersData(userId: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL get_user_servers_data(?)',
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
  ): Promise<Message[]> {
    const result = await this.connection.query('CALL get_messages(?,?,?,?)', [
      userId,
      serverId,
      channelId,
      offset,
    ]);
    return result[0];
  }

  async joinServer(uid: string, invitation: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL join_server(?,?)',
      [uid, invitation],
    );
    await this.addUsersDetailsToResult(result);
    return AppService.processQuery(result);
  }

  private async addUsersDetailsToResult(result: UserServersDataQueryResult) {
    const usersIds = result[3].map(member => ({ ID: member.userId })).filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.keycloakRepository.find({
      select: ['ID', 'USERNAME', 'FIRST_NAME', 'LAST_NAME'],
      where: usersIds,
    });
  }
}
