import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import Channel from "./channel";

@Schema()
class Message {

  _id?: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: "Group" })
  groupId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Channel" })
  channelId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  timestamp: Date;

  static toDTO(message: MessageDocument) {
    const dtoMessage: any = message.toObject();
    delete dtoMessage._id;
    dtoMessage.id = message._id.toString();
    return dtoMessage;
  }

}

export type MessageDocument = Document<any, any, Message> & Message;
export const MessageSchema = SchemaFactory.createForClass(Message);
export default Message;