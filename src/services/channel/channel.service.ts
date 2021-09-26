import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { DatabaseService } from '../database/database.service';
import { ChannelEntity } from '../../entities/channel.entity';
import { ChannelType, MoveChannelRequest, TextChannel, VoiceChannel } from '../../dtos/channel.dto';

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

  async moveChannel(userId: string, payload: MoveChannelRequest): Promise<ChannelEntity[]> {
    // get server channels
    const serverChannels = await this.channelRepository.find({ where: { server_id: payload.serverId } });
    // find my channel
    let myChannelIndex = serverChannels.findIndex(channel => payload.channelId === channel.id);
    if (myChannelIndex === -1) throw new Error('Channel does not exist');
    // check if channel moved to another group
    if (payload.groupId !== serverChannels[myChannelIndex].group_id) {
      // if channel moved to another group
      // remove it from the first group
      let sourceGroupSortedChannels = serverChannels.filter(channel => serverChannels[myChannelIndex].group_id === channel.group_id)
        .sort((ch1, ch2) => ch1.order - ch2.order);
      let destinationGroupSortedChannels = serverChannels.filter(channel => payload.groupId === channel.group_id)
        .sort((ch1, ch2) => ch1.order - ch2.order);
      myChannelIndex = sourceGroupSortedChannels.findIndex(channel => payload.channelId === channel.id);
      if (myChannelIndex === -1) throw new Error('Channel does not exist');
      const myChannel = sourceGroupSortedChannels.splice(myChannelIndex, 1)[0];
      // change channel group id
      myChannel.group_id = payload.groupId;
      // add it to the second group
      destinationGroupSortedChannels.splice(payload.order, 0, myChannel);
      // change source group channels orders
      sourceGroupSortedChannels = sourceGroupSortedChannels.map((channel, order) => ({ ...channel, order }));
      // change destination group channels orders
      destinationGroupSortedChannels = destinationGroupSortedChannels.map((channel, order) => ({ ...channel, order }));
      // save source group channels orders in db
      await Promise.all(sourceGroupSortedChannels.map(channel => this.channelRepository.update(channel.id, { order: channel.order })));
      await Promise.all(destinationGroupSortedChannels.map(channel =>
        this.channelRepository.update(channel.id, channel.id === payload.channelId ?
          {
            group_id: channel.group_id,
            order: channel.order,
          } :
          { order: channel.order }),
      ));
    } else {
      let groupSortedChannels = serverChannels.filter(channel => payload.groupId === channel.group_id)
        .sort((ch1, ch2) => ch1.order - ch2.order);
      myChannelIndex = groupSortedChannels.findIndex(channel => payload.channelId === channel.id);
      const myChannel = groupSortedChannels[myChannelIndex];
      groupSortedChannels[myChannelIndex] = null;
      groupSortedChannels.splice(payload.order, 0, myChannel);
      myChannelIndex = groupSortedChannels.findIndex(channel => channel === null);
      groupSortedChannels.splice(myChannelIndex, 1);
      groupSortedChannels = groupSortedChannels.map((channel, order) => ({ ...channel, order }));
      await Promise.all(groupSortedChannels.map(channel => this.channelRepository.update(channel.id, { order: channel.order })));
    }
    return this.channelRepository.find({ where: { server_id: payload.serverId } });
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
          .map(socketId => ({
            socketId,
            userId: gateway.sockets.sockets.get(socketId).handshake.auth.sub,
            isTalking: false,
          }));
      }
    };
  }

}
