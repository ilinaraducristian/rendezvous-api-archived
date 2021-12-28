import { Injectable } from "@nestjs/common";
import Channel, { ChannelDocument } from "../entities/channel";
import UpdateChannelRequest from "../dtos/update-channel-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { ChannelNotFoundException } from "../exceptions/NotFoundExceptions";
import { getMaxOrder, sortDocuments } from "../util";
import { GroupsService } from "../groups/groups.service";
import ChannelType from "../dtos/channel-type";
import { ServerDocument } from "../entities/server";
import { GroupDocument } from "../entities/group";

@Injectable()
export class ChannelsService {

  constructor(
    private readonly groupsService: GroupsService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createChannel(userId: string, serverId: string, groupId: string, newChannelRequest: Pick<Channel, "name" | "type">) {

    const group = await this.groupsService.getById(userId, serverId, groupId);
    const server = group.$parent() as ServerDocument;
    const lastChannelOrder = getMaxOrder(group.channels);

    const newChannel = {
      name: newChannelRequest.name,
      serverId,
      groupId,
      type: newChannelRequest.type,
      order: lastChannelOrder + 1
    };

    const length = group.channels.push(newChannel);
    await server.save();

    const newChannelDto = Channel.toDTO(group.channels[length - 1] as ChannelDocument, serverId, groupId);
    // this.socketIoService.newChannel(serverId, newChannelDto);
  }

  async getByIdAndType(userId: string, serverId: string, groupId: string, channelId: string, type?: ChannelType) {
    const group = await this.groupsService.getById(userId, serverId, groupId);
    const channel = group.channels.find(channel => channel._id.toString() === channelId);
    if (channel === undefined) throw new ChannelNotFoundException();
    if (type !== undefined && channel.type !== type) throw new ChannelNotFoundException();
    return channel as ChannelDocument;
  }

  async updateChannel(userId: string, serverId: string, groupId: string, channelId: string, channelUpdate: UpdateChannelRequest) {

    const channel = await this.getByIdAndType(userId, serverId, groupId, channelId);

    const group1 = channel.$parent() as GroupDocument;
    const group2 = await this.groupsService.getById(userId, serverId, channelUpdate.groupId);

    const server = group1.$parent() as ServerDocument;

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
        const index = sortedChannels.findIndex(channel => channel._id.toString() === channelId);
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
        const index1 = sortedChannels1.findIndex(channel => channel._id.toString() === channelId);
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
      await server.save();
    }

    return { name: channelUpdate.name, channels };

  }

  async deleteChannel(userId: string, serverId: string, groupId: string, channelId: string) {

    const channel = await this.getByIdAndType(userId, serverId, groupId, channelId);

    const group = channel.$parent() as GroupDocument;
    const server = group.$parent() as ServerDocument;

    const index = group.channels.findIndex(channel => channel._id.toString() === channelId);
    group.channels.splice(index, 1);
    group.channels = sortDocuments(group.channels as ChannelDocument[]);
    await server.save();

    const channels = group.channels.map(channel => ({
      id: channel._id.toString(),
      order: channel.order
    }));

    // this.socketIoService.channelDelete(serverId, channelId, channels);

  }

}
