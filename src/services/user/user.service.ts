import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserServersData } from '../../models/server.model';
import { UserEntity } from '../../entities/user.entity';
import { DatabaseService } from '../database/database.service';
import processQuery from '../../util/process-querry';


@Injectable()
export class UserService {

  constructor(
    private databaseService: DatabaseService,
    @InjectRepository(UserEntity, 'keycloakConnection')
    private keycloakRepository: Repository<UserEntity>,
  ) {
  }

  async getUserData(userId: string): Promise<UserServersData> {
    let result = await this.databaseService.get_user_data(userId);

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
