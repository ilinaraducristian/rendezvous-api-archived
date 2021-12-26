import { Injectable } from "@nestjs/common";
import Channel, { ChannelDocument } from "../entities/channel";
import UpdateChannelRequest from "../dtos/update-channel-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { ChannelNotFoundException } from "../exceptions/NotFoundExceptions";
import { getMaxOrder } from "../util";
import { GroupsService } from "../groups/groups.service";
import ChannelType from "../dtos/channel-type";

@Injectable()
export class ChannelsService {

  constructor(
    private readonly groupsService: GroupsService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createChannel(userId: string, serverId: string, groupId: string, newChannelRequest: Pick<Channel, "name" | "type">) {

    const group = await this.groupsService.getById(userId, serverId, groupId);
    const lastChannelOrder = getMaxOrder(group.channels);

    const newChannel = {
      name: newChannelRequest.name,
      serverId,
      groupId,
      type: newChannelRequest.type,
      order: lastChannelOrder + 1
    };

    const index = group.channels.push(newChannel);
    await group.server.save();

    const newChannelDto = Channel.toDTO(group.channels[index] as ChannelDocument, serverId, groupId);
    this.socketIoService.newChannel(serverId, newChannelDto);
  }

  async getByIdAndType(userId: string, serverId: string, groupId: string, channelId: string, type?: ChannelType) {
    const group = await this.groupsService.getById(userId, serverId, groupId);
    const channel = group.channels.find(channel => channel._id === channelId);
    if (channel === undefined) throw new ChannelNotFoundException();
    if (type !== undefined && channel.type !== type) throw new ChannelNotFoundException();
    channel.group = group;
    return channel;
  }

  async updateChannel(userId: string, serverId: string, groupId: string, channelId: string, channelUpdate: UpdateChannelRequest) {

    const channel = await this.getByIdAndType(userId, serverId, groupId, channelId);

    const group1 = channel.group;
    const group2 = await this.groupsService.getById(userId, serverId, channelUpdate.groupId);

    let isChannelModified = false;

    if (channelUpdate.name !== undefined) {
      isChannelModified = true;
      channel.name = channelUpdate.name;
    }

    let channels;

    if (channelUpdate.order !== undefined) {
      isChannelModified = true;
      if (groupId === channelUpdate.groupId) {
        const sortedChannels = group1.channels.sort((c1, c2) => c1.order - c2.order);
        const index = sortedChannels.findIndex(channel => channel._id === channelId);
        sortedChannels[index] = undefined;
        sortedChannels.splice(channelUpdate.order, 0, channel);
        group1.channels = sortedChannels.filter(channel => channel !== undefined).map((channel, i) => ({
          ...channel,
          order: i
        }));
        channels = group1.channels;
      } else {
        const sortedChannels1 = group1.channels.sort((c1, c2) => c1.order - c2.order);
        const sortedChannels2 = group2.channels.sort((c1, c2) => c1.order - c2.order);
        const index1 = sortedChannels1.findIndex(channel => channel._id === channelId);
        sortedChannels2.splice(channelUpdate.order, 0, sortedChannels1.splice(index1, 1)[0]);
        group1.channels = sortedChannels1.map((channel, i) => ({
          ...channel,
          order: i
        }));
        group2.channels = sortedChannels2.map((channel, i) => ({
          ...channel,
          order: i
        }));
        channels = group1.channels.concat(group2.channels);
      }
      channels = channels.map(channel => ({
        id: channel._id.toString(),
        groupId: channel.groupId,
        order: channel.order
      }));
    }

    if (isChannelModified) {
      await channel.group.server.save();
    }

    return { name: channelUpdate.name, channels };

  }

  async deleteChannel(userId: string, serverId: string, groupId: string, channelId: string) {

    const channel = await this.getByIdAndType(userId, serverId, groupId, channelId);

    const index = channel.group.channels.findIndex(channel => channel._id === channelId);

    channel.group.channels.slice(index, 1);
    channel.group.channels = channel.group.channels.sort((c1, c2) => c1.order - c2.order).map((channel, i) => ({
      ...channel,
      order: i
    }));
    await channel.group.server.save();

    const channels = channel.group.channels.map(channel => ({
      id: channel._id.toString(),
      order: channel.order
    }));

    this.socketIoService.channelDelete(serverId, channelId, channels);

  }

}
