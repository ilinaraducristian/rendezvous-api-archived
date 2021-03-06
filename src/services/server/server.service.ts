import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { ProcedureServerResponseType } from '../../models/database-response.model';
import { UserServersData } from '../../dtos/user.dto';
import { MoveServerRequest, Server, UpdateServerImageRequest } from '../../dtos/server.dto';
import { ChannelType, TextChannel } from '../../dtos/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from '../../entities/server.entity';
import { MemberEntity } from '../../entities/member.entity';
import { ObjectStoreService } from '../object-store/object-store.service';
import { Role } from '../../dtos/role.dto';
import { RoleEntity } from '../../entities/role.entity';

@Injectable()
export class ServerService {

  constructor(
    @InjectRepository(ServerEntity)
    private serverRepository: Repository<ServerEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
    private readonly objectStoreService: ObjectStoreService,
  ) {
  }

  async updateImage(userId: string, payload: UpdateServerImageRequest) {
    let imageMd5 = null;
    if (payload.image !== null) {
      imageMd5 = await this.objectStoreService.putImage(payload.image);
    }
    await this.serverRepository.update(payload.serverId, { image_md5: imageMd5 });
  }

  static async processQuery(
    result: ProcedureServerResponseType,
    objectStoreService: ObjectStoreService,
  ): Promise<Server[]> {

    result[1] = result[1].map(role => {
      Object.keys(role).forEach(key => {
        if (['id', 'serverId', 'name'].includes(key)) return;
        role[key] = !!role[key];
      });
      return role;
    });

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
          roles: result[1].filter(role => role.serverId === server.id),
        };
      }
      return objectStoreService.getImage(newServer.image).then((data: string) => ({
        ...newServer,
        image: data,
        channels: [],
        groups: [],
        members: [],
        roles: result[1].filter(role => role.serverId === server.id),
      }));
    }));

    result[5].forEach(member => {
      const server = serversTable.find(server => server.id === member.serverId);
      if (server === undefined) return;
      if (server.members.findIndex(m1 => m1.id === member.id) === -1)
        server.members.push({
          id: member.id,
          userId: member.userId,
          serverId: member.serverId,
          roles: result[2].filter(memberRole => memberRole.memberId === member.id && memberRole.serverId === server.id).map(memberRole => memberRole.roleId),
        });
    });

    result[3].forEach(group => {
      const server = serversTable.find(server => server.id === group.serverId);
      if (server === undefined) return;
      server.groups.push({ ...group, channels: [] });
    });

    result[4].forEach(channel => {
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
    return serversTable;
    // return {
    //   servers: serversTable,
    //   users: [],
    // };
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    const result = await this.databaseService.create_server(userId, name);
    return this.returnServerData(result);
  }

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    const result = await this.databaseService.join_server(userId, invitation);
    return this.returnServerData(result);
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {

    // check if user/member has access
    const canCreateInvitation = await this.databaseService.user_has_permission(userId, serverId, 'createInvitation');
    if (!canCreateInvitation) throw new Error('User doesnt have permission to create invitations in this server');

    return this.databaseService.create_invitation(userId, serverId)
      .then((result) => Object.values(result[0])[0]);
  }

  async deleteServer(userId: string, serverId: number) {

    // check if user/member has access
    const canDeleteServer = await this.databaseService.user_has_permission(userId, serverId, 'deleteServer');
    if (!canDeleteServer) throw new Error('User doesnt have permission to delete this server');

    return this.serverRepository.delete({ id: serverId });
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

  changePermissions(userId: string, role: Role) {
    return this.roleRepository.update(role.id, {
      rename_server: role.renameServer,
      create_invitation: role.createInvitation,
      delete_server: role.deleteServer,
      create_channels: role.createChannels,
      create_groups: role.createGroups,
      delete_channels: role.deleteChannels,
      delete_groups: role.deleteGroups,
      move_channels: role.moveChannels,
      move_groups: role.moveGroups,
      read_messages: role.readMessages,
      write_messages: role.writeMessages,
    });
  }

  private async returnServerData(result: ProcedureServerResponseType) {
    const usersIds = result[5].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);
    const users = await this.userService.getUsersDetails(usersIds);
    const serversTable = await ServerService.processQuery(result, this.objectStoreService);
    return {
      servers: serversTable,
      users,
    };
  }

}
