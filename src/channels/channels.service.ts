import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Server } from "../entities/server";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import ChannelDTO from "../dtos/channel";
import ChannelNameNotEmptyException from "../exceptions/ChannelNameNotEmpty.exception";
import ChannelType from "../dtos/channel-type";
import ChannelNotFoundException from "../exceptions/ChannelNotFound.exception";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";

@Injectable()
export class ChannelsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly serversService: ServersService,
    private readonly groupsService: GroupsService
  ) {
  }

  async createChannel(serverId: string, groupId: string | null, name: string, type: ChannelType): Promise<ChannelDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw ChannelNameNotEmptyException;

    const server = await this.serversService.getServer(serverId);
    let group;

    if (groupId !== null) {
      group = await this.groupsService.getGroup(groupId);
    }
    const newChannel = new this.channelModel({
      name: trimmedName,
      serverId,
      groupId: group?.id ?? null,
      type
    });
    await newChannel.save();
    if (groupId === null) {
      server.channels.push(newChannel.id);
      await server.save();
    } else {
      group.channels.push(newChannel.id);
      await group.save();
    }
    return Channel.toDTO(newChannel);
  }

  async getChannel(id: string) {
    try {
      const channel = await this.channelModel.findById(id);
      if (channel === null) throw Error();
      return channel;
    } catch (e) {
      throw ChannelNotFoundException;
    }
  }

  async updateChannelName(serverId: string, groupId: string | null, id: string, name: string): Promise<ChannelDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw ChannelNameNotEmptyException;

    await this.serversService.getServer(serverId);
    if (groupId !== null)
      await this.groupsService.getGroup(groupId);

    try {
      const newChannel = await this.channelModel.findOneAndUpdate({ _id: id }, { name: trimmedName }, { new: true });
      return Channel.toDTO(newChannel);
    } catch (e) {
      throw ChannelNotFoundException;
    }
  }

  async deleteChannel(serverId: string, groupId: string | null, id: string): Promise<void> {
    let group;
    const server = await this.serversService.getServer(serverId);

    if (groupId !== null) {
      group = await this.groupsService.getGroup(groupId);
    }

    try {
      const channel = await this.channelModel.findOneAndDelete({ _id: id });
      if (channel === null) throw new Error();
    } catch (e) {
      throw ChannelNotFoundException;
    }

    if (groupId === null) {
      const index = server.channels.findIndex(channel => channel._id === id);
      server.channels.splice(index, 1);
      await server.save();
    } else {
      const index = group.channels.findIndex(channel => channel.id === id);
      group.channels.splice(index, 1);
      await group.save();
    }

  }

}
