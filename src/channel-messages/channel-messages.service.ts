import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SocketIoService } from "src/socket-io/socket-io.service";
import { ChannelsService } from "../channels/channels.service";
import { ChannelType } from "../dtos/channel";
import ChannelMessage, {
    ChannelMessageDocument
} from "../entities/channel-message";
import { MessageNotFoundException } from "../exceptions/NotFoundExceptions";

@Injectable()
export class ChannelMessagesService {
  constructor(
    @InjectModel(ChannelMessage.name)
    private readonly messageModel: Model<ChannelMessage>,
    private readonly channelsService: ChannelsService,
    private readonly socketIoService: SocketIoService
  ) {}

  async createMessage(
    userId: string,
    serverId: string,
    groupId: string,
    channelId: string,
    text: string,
    files: string[]
  ) {
    await this.channelsService.getByIdAndType(
      userId,
      serverId,
      groupId,
      channelId,
      ChannelType.text
    );

    const newMessage = new this.messageModel({
      channelId,
      userId,
      text,
      timestamp: new Date(),
      files,
    });
    await newMessage.save();

    this.socketIoService.newChannelMessage(
      { serverId, groupId, channelId },
      ChannelMessage.toDTO(newMessage, serverId, groupId)
    );
  }

  async getById(
    userId: string,
    serverId: string,
    groupId: string,
    channelId: string,
    messageId: string
  ) {
    const channel = await this.channelsService.getById(
      userId,
      serverId,
      groupId,
      channelId
    );
    let message: ChannelMessageDocument;
    try {
      message = await this.messageModel.findOne({ _id: messageId, channelId });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === undefined || message === null)
      throw new MessageNotFoundException();
    return { message, channel };
  }

  async getMessages(
    userId: string,
    serverId: string,
    groupId: string,
    channelId: string,
    offset: number
  ) {
    await this.channelsService.getByIdAndType(
      userId,
      serverId,
      groupId,
      channelId,
      ChannelType.text
    );

    const messages = await this.messageModel
      .find({
        channelId,
      })
      .sort({ timestamp: 1 })
      .skip(offset)
      .limit(30);

    return messages.map((message) =>
      ChannelMessage.toDTO(message, serverId, groupId)
    );
  }

  async deleteMessage(
    userId: string,
    serverId: string,
    groupId: string,
    channelId: string,
    messageId: string
  ) {
    await this.channelsService.getByIdAndType(
      userId,
      serverId,
      groupId,
      channelId,
      ChannelType.text
    );

    let message;

    try {
      message = await this.messageModel.findOneAndDelete({
        _id: messageId,
        serverId,
        groupId,
        channelId,
      });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === null || message === undefined)
      throw new MessageNotFoundException();

    this.socketIoService.channelMessageDeleted({
      serverId,
      groupId,
      channelId,
      messageId,
    });
  }
}
