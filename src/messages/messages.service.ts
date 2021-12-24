import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import Server from "../entities/server";
import { Model } from "mongoose";
import Channel from "../entities/channel";
import Group from "../entities/group";
import { ServersService } from "../servers/servers.service";
import { Message } from "../entities/message";
import ChannelType from "../dtos/channel-type";
import UpdateMessageRequest from "../dtos/update-message-request";
import { BadChannelTypeException, NotAMemberException } from "../exceptions/BadRequestExceptions";
import { ChannelNotFoundException, MessageNotFoundException } from "../exceptions/NotFoundExceptions";

@Injectable()
export class MessagesService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly serversService: ServersService
  ) {
  }

  async createMessage(userId: string, serverId: string, groupId: string, channelId: string, text: string) {

    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let channel;

    try {
      channel = await this.channelModel.find({ serverId, groupId, _id: channelId });
      if (channel === null) throw new Error();
    } catch (e) {
      throw new ChannelNotFoundException();
    }

    if (channel.type === ChannelType.voice) throw new BadChannelTypeException();

    const newMessage = new this.messageModel({
      text,
      serverId,
      groupId: groupId,
      channelId,
      timestamp: new Date(),
      userId
    });
    await newMessage.save();
    channel.messages.push(newMessage.id);
    await channel.save();
    return Message.toDTO(newMessage);
  }

  async updateMessage(userId: string, serverId: string, groupId: string, channelId: string, id: string, messageUpdate: UpdateMessageRequest) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let channel;

    try {
      channel = await this.channelModel.find({ serverId, groupId, _id: channelId });
      if (channel === null) throw new Error();
    } catch (e) {
      throw new ChannelNotFoundException();
    }

    if (messageUpdate.text !== undefined) {
      try {
        const message = await this.messageModel.findOneAndUpdate({ serverId, groupId, channelId, _id: id }, {
          text: messageUpdate.text
        }, { new: true });
      } catch (e) {
        throw new ChannelNotFoundException();
      }
    }

  }

  // async getMessages(serverId: string, groupId: string, channelId: string, offset: number = 0): Promise<MessageDTO[]> {
  //   const server = await this.serversService.getServer(serverId);
  //   let group, channel;
  //
  //   if (groupId !== null) {
  //     group = await this.groupsService.getGroup(groupId);
  //   }
  //
  //   try {
  //     const channel = await this.channelModel.findById(channelId).select("messages").populate({
  //       path: "messages", options: {
  //         sort: { timestamp: -1 },
  //         limit: 30,
  //         skip: offset
  //       }
  //     });
  //     if (channel === null) throw Error();
  //     return channel.messages.map(message => Message.toDTO(message));
  //   } catch (e) {
  //     if (e === ChannelNotFoundException)
  //       throw ChannelNotFoundException;
  //     throw e;
  //   }
  //
  // }
  //
  async deleteMessage(userId: string, serverId: string, groupId: string, channelId: string, id: string) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    try {
      const message = await this.channelModel.findOneAndDelete({ serverId, groupId, channelId, _id: id });
      if (message === null) throw new Error();
    } catch (e) {
      throw new MessageNotFoundException();
    }

    await this.channelModel.findByIdAndUpdate(channelId, { $pullAll: { messages: [id] } });

  }

}
