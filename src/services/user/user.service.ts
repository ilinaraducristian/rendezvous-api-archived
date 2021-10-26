import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { DatabaseService } from '../database/database.service';
import { ProcedureServerResponseType, ProcedureUserDataResponseType } from '../../models/database-response.model';
import duplicates from '../../util/filter-duplicates';
import { MemberEntity } from '../../entities/member.entity';
import { User, UserData } from '../../dtos/user.dto';
import { ObjectStoreService } from '../object-store/object-store.service';
import { ServerService } from '../server/server.service';


@Injectable()
export class UserService {

  constructor(
    private databaseService: DatabaseService,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
    private readonly objectStoreService: ObjectStoreService,
  ) {
  }

  async getUserData(userId: string): Promise<UserData> {
    const result = await this.databaseService.get_user_data(userId);
    let usersIds = result[5]
      .map(user => ({ ID: user.userId }));
    usersIds = usersIds.concat(
      result[6]
        .map(friendship => ({ ID: friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id })),
    );
    usersIds = usersIds.concat(
      result[7].map(friendRequest => ({ ID: friendRequest.user1Id === userId ? friendRequest.user2Id : friendRequest.user1Id })),
    );
    usersIds = usersIds.filter(duplicates);
    const response = await this.processQuery(result, userId);
    if (usersIds.length === 0) return { ...response, users: [] };
    response.users = await this.getUsersDetails(usersIds);
    return response;
  }

  getUserServersIds(userId: string): Promise<number[]> {
    return this.memberRepository.find({
      select: ['server_id'],
      where: { user_id: userId },
    }).then(servers => servers.map(member => member.server_id));
  }

  private async processQuery(
    result: ProcedureUserDataResponseType,
    userId: string,
  ): Promise<UserData> {

    const serversTable = await ServerService.processQuery(result as unknown as ProcedureServerResponseType, this.objectStoreService);
    const friendships = result[6].map(friendship => Object.assign({ messages: [] }, friendship));
    const friendRequests = result[7].map((friendRequest: any) => ({
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
