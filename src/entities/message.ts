import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
class Message {

  _id?: string;

  @Prop({ type: Types.ObjectId, ref: "Member" })
  channelId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  timestamp: Date;

  static toDTO(message: MessageDocument, serverId: string, groupId: string) {
    const dtoMessage: any = message.toObject();
    delete dtoMessage._id;
    dtoMessage.id = message._id.toString();
    dtoMessage.serverId = serverId;
    dtoMessage.groupId = groupId;
    return dtoMessage;
  }

}

export type MessageDocument = Document<any, any, Message> & Message;
export const MessageSchema = SchemaFactory.createForClass(Message);
export default Message;