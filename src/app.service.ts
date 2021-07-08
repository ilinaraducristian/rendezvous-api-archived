import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerEntity } from './entities/server.entity';
import {
  Channel,
  ChannelType,
  Group,
  Member,
  Message,
  Server,
  User,
  UserServersData,
  UserServersDataQueryResult,
} from './types';
import fetch from 'node-fetch';

@Injectable()
export class AppService {
  constructor(
    private connection: Connection,
    @InjectRepository(ServerEntity)
    private serverRepository: Repository<ServerEntity>,
  ) {}

  private static processQuery(
    result: UserServersDataQueryResult,
  ): UserServersData {
    const serversTable = result[0].map<[number, Server]>((server: Server) => [
      server.id,
      server,
    ]);
    const groupsTable = result[1].map<[number, Group]>((group: Group) => [
      group.id,
      group,
    ]);
    const channelsTable = result[2].map<[number, Channel]>(
      (channel: Channel) => [channel.id, channel],
    );

    const membersTable: [number, Member][] = [];
    const usersTable: [string, User][] = [];

    result[3].forEach((member: Member & User) => {
      membersTable.push([
        member.id,
        {
          id: member.id,
          userId: member.userId,
          serverId: member.serverId,
        },
      ]);
      usersTable.push([
        member.userId,
        {
          id: member.userId,
          username: member.username,
          firstName: member.firstName,
          lastName: member.lastName,
        },
      ]);
    });

    return {
      servers: serversTable,
      channels: channelsTable,
      groups: groupsTable,
      members: membersTable,
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
    let result = await this.connection.query('CALL create_server(?,?)', [
      uid,
      name,
    ]);
    return AppService.processQuery(result);
  }

  async getUserServersData(userId: string): Promise<UserServersData> {
    // get data from database
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL get_user_servers_data(?)',
      [userId],
    );
    return AppService.processQuery(result);
  }

  async getMessages(
    userId: string,
    channelId: number,
    offset: number,
  ): Promise<[number, Message][]> {
    const result = await this.connection.query('CALL get_messages(?,?,?)', [
      userId,
      channelId,
      offset,
    ]);
    return result[0].map((result) => [result.id, result]);
  }

  async joinServer(uid: string, invitation: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.connection.query(
      'CALL join_server(?,?)',
      [uid, invitation],
    );
    return AppService.processQuery(result);
  }
}
