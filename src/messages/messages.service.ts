import { Injectable } from "@nestjs/common";
import Message, { MessageDocument } from "../entities/message";
import ChannelType from "../dtos/channel-type";
import { MessageNotFoundException } from "../exceptions/NotFoundExceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChannelsService } from "../channels/channels.service";

@Injectable()
export class MessagesService {

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly channelsService: ChannelsService
  ) {
  }

  async createMessage(userId: string, serverId: string, groupId: string, channelId: string, text: string) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

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

  async getMessages(userId: string, serverId: string, groupId: string, channelId: string, offset: number) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

    const messages = await this.messageModel.find({
      serverId,
      groupId,
      channelId
    }).sort({ date: 1 }).skip(offset).limit(30);

    return messages.map(message => Message.toDTO(message));

  }

  async deleteMessage(userId: string, serverId: string, groupId: string, channelId: string, messageId: string) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

    let message;

    try {
      message = await this.messageModel.findOneAndDelete({ _id: messageId, serverId, groupId, channelId });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === null) throw new MessageNotFoundException();

  }

}
