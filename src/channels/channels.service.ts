import { Injectable } from "@nestjs/common";
import Channel, { ChannelDocument } from "../entities/channel";
import UpdateChannelRequest from "../dtos/update-channel-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { ChannelNotFoundException, GroupNotFoundException } from "../exceptions/NotFoundExceptions";
import { MembersService } from "../members/members.service";
import { ServersService } from "../servers/servers.service";
import { getMaxOrder } from "../util";

@Injectable()
export class ChannelsService {

  constructor(
    private readonly serversService: ServersService,
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createChannel(userId: string, serverId: string, groupId: string, newChannelRequest: Pick<Channel, "name" | "type">) {

    const server = await this.serversService.getById(userId, serverId);
    const group = server.groups.find(group => group._id === groupId);
    const lastChannelOrder = getMaxOrder(group.channels);

    const newChannel = {
      name: newChannelRequest.name,
      serverId,
      groupId,
      type: newChannelRequest.type,
      order: lastChannelOrder + 1
    };

    const index = group.channels.push(newChannel);
    await server.save();

    const newChannelDto = Channel.toDTO(group.channels[index] as ChannelDocument, serverId, groupId);
    this.socketIoService.newChannel(serverId, newChannelDto);
  }

  async updateChannel(userId: string, serverId: string, groupId: string, channelId: string, channelUpdate: UpdateChannelRequest) {

    const server = await this.serversService.getById(userId, serverId);
    const group1 = server.groups.find(group => group._id === groupId);
    const group2 = server.groups.find(group => group._id === channelUpdate.groupId);

    if (group1 === undefined || group2 === undefined) throw new GroupNotFoundException();

    const channel = group1.channels.find(channel => channel._id === channelId);

    if (channel === undefined) throw new ChannelNotFoundException();

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
        id: channel.id.toString(),
        groupId: channel.groupId,
        order: channel.order
      }));
    }

    if (isChannelModified) {
      await server.save();
    }

    return { name: channelUpdate.name, channels };

  }

  async deleteChannel(userId: string, serverId: string, groupId: string, channelId: string) {

    const server = await this.serversService.getById(userId, serverId);
    const group = server.groups.find(group => group._id === groupId);

    if (group === undefined) throw new GroupNotFoundException();

    const index = group.channels.findIndex(channel => channel._id === channelId);

    if (index === -1) throw new ChannelNotFoundException();

    group.channels.slice(index, 1);
    group.channels = group.channels.sort((c1, c2) => c1.order - c2.order).map((channel, i) => ({
      ...channel,
      order: i
    }));
    await server.save();

    const channels = group.channels.map(channel => ({
      id: channel._id.toString(),
      order: channel.order
    }));

    this.socketIoService.channelDelete(serverId, channelId, channels);

  }

}
