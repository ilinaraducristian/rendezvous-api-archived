import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { ProcedureServerResponseType } from '../../models/database-response.model';
import { UserServersData } from '../../dtos/user.dto';
import { Server } from '../../dtos/server.dto';
import { ChannelType, TextChannel } from '../../dtos/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from '../../entities/server.entity';

@Injectable()
export class ServerService {

  constructor(
    @InjectRepository(ServerEntity)
    private serverRepository: Repository<ServerEntity>,
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {
  }

  private static processQuery(
    result: ProcedureServerResponseType,
  ): UserServersData {

    const serversTable: Server[] = result[0].map(server => ({
      ...server,
      channels: [],
      groups: [],
      members: [],
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

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    let result = await this.databaseService.join_server(userId, invitation);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    const users = await this.userService.getUsersDetails(usersIds);

    const response = ServerService.processQuery(result);
    response.users = users;
    return response;
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {
    return this.databaseService.create_invitation(userId, serverId)
      .then((result) => Object.values(result[0])[0]);
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    let result = await this.databaseService.create_server(userId, name);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    const users = await this.userService.getUsersDetails(usersIds);

    const response = ServerService.processQuery(result);
    response.users = users;
    return response;
  }

  deleteServer(userId: string, serverId: number) {
    return this.serverRepository.delete({ id: serverId });
  }

}
