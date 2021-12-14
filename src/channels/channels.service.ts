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
import NotAMemberException from "../exceptions/NotAMember.exception";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import UpdateChannelRequest from "../dtos/update-channel-request";

@Injectable()
export class ChannelsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly serversService: ServersService
  ) {
  }

  async createChannel(userId: string, serverId: string, groupId: string | null, name: string, type: ChannelType): Promise<ChannelDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw new ChannelNameNotEmptyException();

    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const channels = await this.channelModel.find({ serverId }).sort({ order: -1 }).limit(1);

    const newChannel = new this.channelModel({
      name: trimmedName,
      serverId,
      groupId,
      type,
      order: (channels[0]?.order ?? -1) + 1
    });

    if (groupId === null) {
      await this.serverModel.findByIdAndUpdate(serverId, { $push: { channels: newChannel.id } });
    } else {
      await this.groupModel.findByIdAndUpdate(groupId, { $push: { channels: newChannel.id } });
    }

    await newChannel.save();
    return Channel.toDTO(newChannel);
  }

  async updateChannel(userId: string, serverId: string, id: string, channelUpdate: UpdateChannelRequest) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let trimmedName;
    if (channelUpdate.name !== undefined) {
      trimmedName = channelUpdate.name.trim();
      if (trimmedName.length === 0) throw new ChannelNameNotEmptyException();
    }

    let channel;

    try {
      channel = await this.channelModel.findOneAndUpdate({ _id: id }, {
        name: trimmedName
      }, { new: true });
    } catch (e) {
      throw new ChannelNotFoundException();
    }

    let channels;

    if (channelUpdate.order === undefined) return { name: trimmedName };
    if (channel.groupId.toString() === channelUpdate.groupId) {
      channels = await this.channelModel.find({ groupId: channelUpdate.groupId }).sort({ order: 1 });
      let index = channels.findIndex(channel => channel.id.toString() === id);
      channel = channels[index];
      channels[index] = undefined;
      channels.splice(channelUpdate.order, 0, channel);
      index = channels.findIndex(channel => channel === undefined);
      channels.splice(index, 1);
      channels = await this.channelModel.bulkSave(channels.map((channel, i) => {
        channel.order = i;
        return channel;
      }));
      channels = channels.map(channel => ({
        id: channel.id.toString(),
        groupId: channel.groupId,
        order: channel.order
      }));
    } else {
      let channels1 = await this.channelModel.find({ groupId: channel.groupId }).sort({ order: 1 });
      let channels2 = await this.channelModel.find({ groupId: channelUpdate.groupId }).sort({ order: 1 });
      const index = channels1.findIndex(channel => channel.id.toString() === id);

      channels1[index].groupId = channelUpdate.groupId;

      channels2.splice(channelUpdate.order, 0, channels1[index]);
      channels1.splice(index, 1);

      channels1 = channels1.map((channel, i) => {
        channel.order = i;
        return channel;
      });
      channels2 = channels2.map((channel, i) => {
        channel.order = i;
        return channel;
      });

      channels = await this.channelModel.bulkSave(channels1.concat(channels2));
      channels = channels.map(channel => ({
        id: channel.id.toString(),
        groupId: channel.groupId,
        order: channel.order
      }));
    }

    return { name: trimmedName, channels };

  }

  async deleteChannel(userId: string, serverId: string, groupId: string | null, id: string): Promise<void> {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    try {
      const channel = await this.channelModel.findOneAndDelete({ _id: id });
      if (channel === null) throw new Error();
    } catch (e) {
      throw new ChannelNotFoundException();
    }

    if (groupId === null) {
      try {
        const server = await this.serverModel.findByIdAndUpdate(serverId, { $pullAll: { channels: [id] } });
        if (server === null) throw new Error();
      } catch (e) {
        throw new ServerNotFoundException();
      }
    } else {
      try {
        const group = await this.groupModel.findByIdAndUpdate(groupId, { $pullAll: { channels: [id] } });
        if (group === null) throw new Error();
      } catch (e) {
        throw new GroupNotFoundException();
      }
    }

  }

}
