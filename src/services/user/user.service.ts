import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/services/database/database.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserServersData } from 'src/models/server.model';
import { UserServersDataQueryResult } from 'src/models/server.model';
import processQuery from 'src/util/process-querry';

@Injectable()
export class UserService {

  constructor(
    private databaseService: DatabaseService,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
  ) {
  }

  async getUserData(userId: string): Promise<UserServersData> {
    let result: UserServersDataQueryResult = await this.databaseService.get_user_data(userId);

    const usersIds = result[3].map(member => ({ ID: member.userId }))
      .filter((user, index, array) => array.indexOf(user) === index);

    result[4] = await this.getUsersDetails(usersIds);

    return processQuery(result);
  }

  getUsersDetails(usersIds: { ID: string }[]) {
    return this.keycloakRepository.find({
      select: ['ID', 'USERNAME', 'FIRST_NAME', 'LAST_NAME'],
      where: usersIds,
    });
  }

}
