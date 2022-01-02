import { Injectable } from "@nestjs/common";
import ChannelMessage from "../entities/channel-message";
import ChannelType from "../dtos/channel-type";
import { MessageNotFoundException } from "../exceptions/NotFoundExceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChannelsService } from "../channels/channels.service";

@Injectable()
export class ChannelMessagesService {

  constructor(
    @InjectModel(ChannelMessage.name) private readonly messageModel: Model<ChannelMessage>,
    private readonly channelsService: ChannelsService
  ) {
  }

  async createMessage(userId: string, serverId: string, groupId: string, channelId: string, text: string, files: string[]) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

    const newMessage = new this.messageModel({
      channelId,
      userId,
      text,
      timestamp: new Date(),
      files
    });
    await newMessage.save();

    return ChannelMessage.toDTO(newMessage, serverId, groupId);
  }

  async getMessages(userId: string, serverId: string, groupId: string, channelId: string, offset: number) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

    const messages = await this.messageModel.find({
      channelId
    }).sort({ timestamp: -1 }).skip(offset).limit(30);

    return messages.map(message => ChannelMessage.toDTO(message, serverId, groupId));

  }

  async deleteMessage(userId: string, serverId: string, groupId: string, channelId: string, messageId: string) {

    await this.channelsService.getByIdAndType(userId, serverId, groupId, channelId, ChannelType.text);

    let message;

    try {
      message = await this.messageModel.findOneAndDelete({ _id: messageId, serverId, groupId, channelId });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === null || message === undefined) throw new MessageNotFoundException();

  }

}
