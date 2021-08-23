import { Injectable } from '@nestjs/common';
import { UserServersData } from 'src/models/server.model';
import { UserServersDataQueryResult } from 'src/models/server.model';
import processQuery from 'src/util/process-querry';
import { DatabaseService } from 'src/services/database/database.service';
import { AppService } from 'src/services/app/app.service';

@Injectable()
export class ServerService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly appService: AppService,
  ) {
  }

  async joinServer(userId: string, invitation: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.databaseService.join_server(userId, invitation);
    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.appService.getUsersDetails(usersIds);
    return processQuery(result);
  }

  async createServer(userId: string, name: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.databaseService.create_server(userId, name);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.appService.getUsersDetails(usersIds);

    return processQuery(result);
  }

  async createInvitation(userId: string, serverId: number): Promise<string> {
    return this.databaseService.create_invitation(userId, serverId)
      .then((result) => Object.entries(result[0])[0][1] as string);
  }

}
