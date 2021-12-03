import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Channel } from "./channel";
import MessageDTO from "../dtos/message";

@Schema()
export class Message {

  _id: string = "";

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: "Group" })
  groupId: string | null;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Channel" })
  channelId: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  userId: string;

  static toDTO(message: Message & { id?: string }): MessageDTO {
    return {
      id: message.id,
      serverId: message.serverId.toString(),
      channelId: message.channelId.toString(),
      groupId: message.groupId?.toString() ?? null,
      friendId: null,
      timestamp: message.timestamp.toISOString(),
      text: message.text,
      userId: message.userId,
      replyMessage: null,
      reactions: [],
      attachments: []
    };
  }

}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);