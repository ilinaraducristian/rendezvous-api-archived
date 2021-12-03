import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Server } from "../entities/server";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import MessageDTO from "../dtos/message";
import MessageNotEmptyException from "../exceptions/MessageNotEmpty.exception";
import { ChannelsService } from "../channels/channels.service";
import { Message } from "../entities/message";
import MessageNotFoundException from "../exceptions/MessageNotFound.exception";
import ChannelNotFoundException from "../exceptions/ChannelNotFound.exception";

@Injectable()
export class MessagesService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly serversService: ServersService,
    private readonly groupsService: GroupsService,
    private readonly channelsService: ChannelsService
  ) {
  }

  async createMessage(serverId: string, groupId: string | null, channelId: string, text: string): Promise<MessageDTO> {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) throw MessageNotEmptyException;

    const server = await this.serversService.getServer(serverId);
    const channel = await this.channelsService.getChannel(channelId);
    let group;

    if (groupId !== null) {
      group = await this.groupsService.getGroup(groupId);
    }
    const newMessage = new this.messageModel({
      text: trimmedText,
      serverId,
      groupId: group?.id ?? null,
      channelId,
      timestamp: new Date(),
      userId: "123"
    });
    await newMessage.save();
    channel.messages.push(newMessage.id);
    await channel.save();
    return Message.toDTO(newMessage);
  }

  async getMessages(serverId: string, groupId: string | null, channelId: string, offset: number = 0): Promise<MessageDTO[]> {
    const server = await this.serversService.getServer(serverId);
    let group, channel;

    if (groupId !== null) {
      group = await this.groupsService.getGroup(groupId);
    }

    try {
      const channel = await this.channelModel.findById(channelId).select("messages").populate({
        path: "messages", options: {
          sort: { timestamp: -1 },
          limit: 30,
          skip: offset
        }
      });
      if (channel === null) throw Error();
      return channel.messages.map(message => Message.toDTO(message));
    } catch (e) {
      throw ChannelNotFoundException;
    }

  }

  async updateMessageText(serverId: string, groupId: string | null, channelId: string, id: string, text: string): Promise<MessageDTO> {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) throw MessageNotEmptyException;

    await this.serversService.getServer(serverId);
    if (groupId !== null)
      await this.groupsService.getGroup(groupId);
    await this.channelsService.getChannel(channelId);

    try {
      const newMessage = await this.messageModel.findOneAndUpdate({ _id: id }, { text: trimmedText }, { new: true });
      return Message.toDTO(newMessage);
    } catch (e) {
      throw MessageNotFoundException;
    }
  }

  async deleteMessage(serverId: string, groupId: string | null, channelId: string, id: string): Promise<void> {
    let group;
    const server = await this.serversService.getServer(serverId);
    const channel = await this.channelsService.getChannel(channelId);

    if (groupId !== null) {
      group = await this.groupsService.getGroup(groupId);
    }

    try {
      const message = await this.messageModel.findOneAndDelete({ _id: id });
      if (message === null) throw new Error();
    } catch (e) {
      throw MessageNotFoundException;
    }

    const index = channel.messages.findIndex(message => message._id === id);
    channel.messages.splice(index, 1);
    await channel.save();

  }


}
