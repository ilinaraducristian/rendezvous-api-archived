import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { ChannelEntity } from '../../entities/channel.entity';

@Injectable()
export class GroupService {

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRepository(ChannelEntity)
    private channelRepository: Repository<ChannelEntity>,
  ) {
  }

  async createGroup(
    userId: string,
    serverId: number,
    name: string,
  ): Promise<number> {
    return this.databaseService.create_group(userId, serverId, name)
      .then((result) => Object.values(result[0])[0]);
  }

  async moveGroup() {

  }

}
