import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { ProcedureServerResponseType } from '../../models/database-response.model';
import { UserServersData } from '../../dtos/user.dto';
import { MoveServerRequest, UpdateServerImageRequest } from '../../dtos/server.dto';
import { ChannelType, TextChannel } from '../../dtos/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from '../../entities/server.entity';
import { MemberEntity } from '../../entities/member.entity';
import { ObjectStoreService } from '../object-store/object-store.service';

@Injectable()
export class ServerService {

  constructor(
    @InjectRepository(ServerEntity)
    private serverRepository: Repository<ServerEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
    private readonly objectStoreService: ObjectStoreService,
  ) {
  }

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    let result = await this.databaseService.join_server(userId, invitation);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    const users = await this.userService.getUsersDetails(usersIds);

    const response = await this.processQuery(result);
    response.users = users;
    return response;
  }

  async updateImage(userId: string, payload: UpdateServerImageRequest) {
    let imageMd5 = null;
    if (payload.image !== null) {
      imageMd5 = await this.objectStoreService.putImage(payload.image);
    }
    await this.serverRepository.update(payload.serverId, { image_md5: imageMd5 });
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    let result = await this.databaseService.create_server(userId, name);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    const users = await this.userService.getUsersDetails(usersIds);

    const response = await this.processQuery(result);
    response.users = users;
    return response;
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {
    return this.databaseService.create_invitation(userId, serverId)
      .then((result) => Object.values(result[0])[0]);
  }

  private async processQuery(
    result: ProcedureServerResponseType,
  ): Promise<UserServersData> {

    const serversTable: any = await Promise.all(result[0].map(server => {
      const newServer = Object.assign({ image: null }, server);
      newServer.image = server.imageMd5;
      delete newServer.imageMd5;
      if (newServer.image === null) {
        return {
          ...newServer,
          channels: [],
          groups: [],
          members: [],
        };
      }
      return this.objectStoreService.getImage(newServer.image).then((data: string) => ({
        ...newServer,
        image: data,
        channels: [],
        groups: [],
        members: [],
      }));
    }));

    result[3].forEach(member => {
      const server = serversTable.find(server => server.id === member.serverId);
      if (server === undefined) return;
      if (server.members.findIndex(m1 => m1.id === member.id) === -1)
        server.members.push({
          id: member.id,
          userId: member.userId,
          serverId: member.serverId,
        });
    });

    result[1].forEach(group => {
      const server = serversTable.find(server => server.id === group.serverId);
      if (server === undefined) return;
      server.groups.push({ ...group, channels: [] });
    });

    result[2].forEach(channel => {
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
      users: [],
    };
  }

  async moveServer(userId: string, { serverId, order }: MoveServerRequest) {
    const findMembers = () => {
      return this.memberRepository.find({ select: ['id', 'server_id', 'order'], where: { user_id: userId } });
    };
    let members = await findMembers();
    const memberIndex = members.findIndex(member => member.server_id === serverId);
    if (memberIndex === -1) return;
    const member = members[memberIndex];
    if (member.order === order || member.order + 1 === order) return;
    members[memberIndex] = undefined;
    members.splice(order, 0, member);
    members.splice(members.findIndex(member => member === undefined), 1);
    members = members.map((server, index) => ({ ...server, order: index }));
    await Promise.all(members.map(({ id, order }) => this.memberRepository.update(id, { order })));
    return await findMembers();
  }

  deleteServer(userId: string, serverId: number) {
    return this.serverRepository.delete({ id: serverId });
  }

}
