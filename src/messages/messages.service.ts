import { Injectable } from "@nestjs/common";
import { ServersService } from "../servers/servers.service";
import Message, { MessageDocument } from "../entities/message";
import ChannelType from "../dtos/channel-type";
import { BadChannelTypeException, NotAMemberException } from "../exceptions/BadRequestExceptions";
import {
  ChannelNotFoundException,
  GroupNotFoundException,
  MessageNotFoundException
} from "../exceptions/NotFoundExceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MembersService } from "../members/members.service";

@Injectable()
export class MessagesService {

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly membersService: MembersService,
    private readonly serversService: ServersService
  ) {
  }

  async createMessage(userId: string, serverId: string, groupId: string, channelId: string, text: string) {

    const server = await this.serversService.getById(userId, serverId);
    const group = server.groups.find(group => group._id === groupId);

    if (group === undefined) throw new GroupNotFoundException();

    const channel = group.channels.find(channel => channel._id === channelId);

    if (channel === undefined) throw new ChannelNotFoundException();

    if (channel.type === ChannelType.voice) throw new BadChannelTypeException();

    const newMessage = new this.messageModel({
      serverId,
      groupId: groupId,
      channelId,
      userId,
      text,
      timestamp: new Date()
    });
    await newMessage.save();

    return Message.toDTO(newMessage as MessageDocument);
  }

  async deleteMessage(userId: string, serverId: string, groupId: string, channelId: string, messageId: string) {
    const isMember = await this.membersService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let message;

    try {
      message = await this.messageModel.findOneAndDelete({ _id: messageId, serverId, groupId, channelId });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === null) throw new MessageNotFoundException();

  }

}
