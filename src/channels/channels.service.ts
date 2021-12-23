import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Server } from "../entities/server";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import ChannelDTO from "../dtos/channel";
import ChannelType from "../dtos/channel-type";
import ChannelNotFoundException from "../exceptions/ChannelNotFound.exception";
import { ServersService } from "../servers/servers.service";
import NotAMemberException from "../exceptions/NotAMember.exception";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import UpdateChannelRequest from "../dtos/update-channel-request";
import { SocketIoService } from "../socket-io/socket-io.service";

@Injectable()
export class ChannelsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly serversService: ServersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createChannel(userId: string, serverId: string, groupId: string, name: string, type: ChannelType): Promise<ChannelDTO> {

    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const channels = await this.channelModel.find({ serverId, groupId }).sort({ order: -1 }).limit(1);

    const newChannel = new this.channelModel({
      name,
      serverId,
      groupId,
      type,
      order: (channels[0]?.order ?? -1) + 1
    });

    await this.groupModel.findByIdAndUpdate(groupId, { $push: { channels: newChannel.id } });

    await newChannel.save();
    const newChannelDto = Channel.toDTO(newChannel);
    this.socketIoService.newChannel(serverId, newChannelDto);
    return newChannelDto;
  }

  async updateChannel(userId: string, serverId: string, groupId: string, id: string, channelUpdate: UpdateChannelRequest) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let channel;

    if (channelUpdate.name !== undefined) {
      try {
        channel = await this.channelModel.findOneAndUpdate({ serverId, groupId, _id: id }, {
          name: channelUpdate.name
        }, { new: true });
      } catch (e) {
        throw new ChannelNotFoundException();
      }
    }

    let channels;

    if (channelUpdate.order === undefined) return { name: channelUpdate.name };

    if (channel.groupId.toString() === channelUpdate.groupId) {
      channels = await this.channelModel.find({ groupId: channelUpdate.groupId }).sort({ order: 1 });
      let index = channels.findIndex(channel => channel.id.toString() === id);
      channel = channels[index];
      channels[index] = undefined;
      channels.splice(channelUpdate.order, 0, channel);
      index = channels.findIndex(channel => channel === undefined);
      channels.splice(index, 1);
      channels = channels.map((channel, i) => {
        channel.order = i;
        return channel;
      });
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

      channels = channels1.concat(channels2);
    }
    await this.channelModel.bulkSave(channels);
    channels = channels.map(channel => ({
      id: channel.id.toString(),
      groupId: channel.groupId,
      order: channel.order
    }));

    return { name: channelUpdate.name, channels };

  }

  async deleteChannel(userId: string, serverId: string, groupId: string, id: string) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    try {
      const channel = await this.channelModel.findOneAndDelete({ serverId, groupId, _id: id });
      if (channel === null) throw new Error();
    } catch (e) {
      throw new ChannelNotFoundException();
    }

    const channels = await this.channelModel.find({ serverId, groupId }).sort({ order: 1 });
    await this.channelModel.bulkSave(channels.map((channel, i) => {
      channel.order = i;
      return channel;
    }));
    try {
      const group = await this.groupModel.findByIdAndUpdate(groupId, { $pullAll: { channels: [id] } });
      if (group === null) throw new Error();
    } catch (e) {
      throw new GroupNotFoundException();
    }

  }

}
