import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { DatabaseService } from '../database/database.service';
import { ChannelEntity } from '../../entities/channel.entity';
import { ChannelType, TextChannel, VoiceChannel } from '../../models/channel.model';

@Injectable()
export class ChannelService {

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRepository(ChannelEntity)
    private channelRepository: Repository<ChannelEntity>,
  ) {
  }

  async createChannel(
    userId: string,
    serverId: number,
    groupId: number | null,
    type: ChannelType,
    name: string,
  ): Promise<number> {
    return this.databaseService.create_channel(
      userId,
      serverId,
      groupId,
      type,
      name,
    )
      .then((result) => Object.values(result[0])[0]);
  }

  async moveChannel(userId: string, payload: any) {
    await this.channelRepository.update(payload.channelId, { order: payload.order, group_id: payload.groupId });
  }

  processChannel(gateway: Server) {
    return (channel: VoiceChannel & TextChannel) => {
      if (channel.type === ChannelType.Text) {
        channel.messages = [];
      } else if (channel.type === ChannelType.Voice) {
        const room = gateway.of('/').adapter.rooms.get(`channel_${channel.id}`);
        channel.users = [];
        if (room === undefined) return;
        channel.users = Array.from(room)
          .map(socketId => ({ socketId, userId: gateway.sockets.sockets.get(socketId).handshake.auth.sub }));
      }
    };
  }

}
