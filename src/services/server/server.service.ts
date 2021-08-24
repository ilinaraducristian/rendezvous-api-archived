import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';
import { UserServersData } from '../../models/server.model';
import processQuery from '../../util/process-querry';

@Injectable()
export class ServerService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {
  }

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    let result = await this.databaseService.join_server(userId, invitation);
    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.userService.getUsersDetails(usersIds);
    return processQuery(result);
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    let result = await this.databaseService.create_server(userId, name);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.userService.getUsersDetails(usersIds);

    return processQuery(result);
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {
    return this.databaseService.create_invitation(userId, serverId)
      .then((result) => Object.values(result[0])[0]);
  }

}
