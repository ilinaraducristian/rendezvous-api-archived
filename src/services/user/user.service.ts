import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Server, { UserData } from '../../models/server.model';
import { UserEntity } from '../../entities/user.entity';
import { DatabaseService } from '../database/database.service';
import User from '../../models/user.model';
import { ProcedureUserDataResponseType } from '../../models/database-response.model';
import Member from '../../models/member.model';
import Group from '../../models/group.model';
import { ChannelType, TextChannel, VoiceChannel } from '../../models/channel.model';
import duplicates from '../../util/filter-duplicates';
import { MemberEntity } from '../../entities/member.entity';


@Injectable()
export class UserService {

  constructor(
    private databaseService: DatabaseService,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
  ) {
  }

  private static processQuery(
    result: ProcedureUserDataResponseType,
    userId: string,
  ): UserData {

    const serversTable: Server[] = result[0].map((server: Omit<Server, 'channels' | 'groups' | 'members'>) => ({
      ...server,
      channels: [],
      groups: [],
      members: [],
    }));

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
    const friendships = result[4].map(friendship => Object.assign({ messages: [] }, friendship));
    const friendRequests = result[5].map((friendRequest: any) => ({
      id: friendRequest.id,
      userId: friendRequest.user1Id === userId ? friendRequest.user2Id : friendRequest.user1Id,
      incoming: friendRequest.user2Id === userId,
    }));
    return {
      servers: serversTable,
      friendships,
      friendRequests,
      users: [],
    };
  }

  getUserServersIds(userId: string): Promise<number[]> {
    return this.memberRepository.find({
      select: ['server_id'],
      where: { user_id: userId },
    }).then(servers => servers.map(member => member.server_id));
  }

  async getUserData(userId: string): Promise<UserData> {
    const result = await this.databaseService.get_user_data(userId);
    let usersIds = result[3]
      .map(user => ({ ID: user.userId }));
    usersIds = usersIds.concat(
      result[4]
        .map(friendship => ({ ID: friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id })),
    );
    usersIds = usersIds.concat(
      result[5].map(friendRequest => ({ ID: friendRequest.user1Id === userId ? friendRequest.user2Id : friendRequest.user1Id })),
    );
    usersIds = usersIds.filter(duplicates);
    const response = UserService.processQuery(result, userId);
    if (usersIds.length === 0) return { ...response, users: [] };
    response.users = await this.getUsersDetails(usersIds);
    return response;
  }

  getUsersDetails(usersIds: { ID: string }[]): Promise<User[]> {
    return this.keycloakRepository.find({
      select: ['ID', 'USERNAME', 'FIRST_NAME', 'LAST_NAME'],
      where: usersIds,
    }).then(userEntity => userEntity.map(userEntity => ({
      id: userEntity.ID,
      username: userEntity.USERNAME,
      firstName: userEntity.FIRST_NAME,
      lastName: userEntity.LAST_NAME,
    })));
  }

  sendFriendRequest(user1Id: string, user2Id: string): Promise<number> {
    return this.databaseService.send_friend_request(user1Id, user2Id)
      .then((result) => Object.values(result[0])[0] as number);
  }

  getUserIdByUsername(username: string): Promise<string | undefined> {
    return this.keycloakRepository.find({
      select: ['ID'],
      where: { USERNAME: username },
    }).then(user => user[0].ID);
  }

  acceptFriendRequest(userId: string, friendRequestId: number) {
    return this.databaseService.change_friend_request(userId, friendRequestId);
  }

}
