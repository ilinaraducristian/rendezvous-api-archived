import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import FriendshipMessage from "../entities/friendship-message";
import { MessageNotFoundException } from "../exceptions/NotFoundExceptions";
import { FriendshipsService } from "../friendships/friendships.service";

@Injectable()
export class FriendshipMessagesService {

  constructor(
    private readonly friendshipsService: FriendshipsService,
    @InjectModel(FriendshipMessage.name) private readonly messageModel: Model<FriendshipMessage>
  ) {
  }

  async createMessage(userId: string, friendshipId: string, text: string) {

    await this.friendshipsService.getById(userId, friendshipId);

    const newMessage = new this.messageModel({
      friendshipId,
      userId,
      text,
      timestamp: new Date()
    });
    await newMessage.save();

    return FriendshipMessage.toDTO(newMessage);
  }

  async getMessages(userId: string, friendshipId: string, offset: number) {

    await this.friendshipsService.getById(userId, friendshipId);

    const messages = await this.messageModel.find({
      friendshipId
    }).sort({ timestamp: 1 }).skip(offset).limit(30);

    return messages.map(message => FriendshipMessage.toDTO(message));

  }

  async deleteMessage(userId: string, friendshipId: string, messageId: string) {

    await this.friendshipsService.getById(userId, friendshipId);

    let message;

    try {
      message = await this.messageModel.findOneAndDelete({ _id: messageId, friendshipId, userId });
    } catch (e) {
      throw new MessageNotFoundException();
    }
    if (message === null || message === undefined) throw new MessageNotFoundException();

  }

}
