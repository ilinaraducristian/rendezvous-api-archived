import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/services/database/database.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEntity } from 'src/entities/channel.entity';
import { Repository } from 'typeorm';

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
      .then((result) => Object.entries(result[0])[0][1] as number);
  }

  async moveGroup() {

  }

}
