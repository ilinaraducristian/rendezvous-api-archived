import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { FriendshipEntity } from '../../entities/friendship.entity';

@Injectable()
export class FriendshipService {

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,
  ) {
  }

  getFriendshipById(id: number) {
    return this.friendshipRepository.findOne({ where: { id } });
  }

}
