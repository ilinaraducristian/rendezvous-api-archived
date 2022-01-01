import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import Message from "./message";

@Schema()
class ChannelMessage extends Message {

  @Prop({ type: Types.ObjectId, ref: "Member" })
  channelId: string;

  static toDTO(message: ChannelMessageDocument, serverId: string, groupId: string) {
    const dtoMessage: any = message.toObject();
    delete dtoMessage._id;
    dtoMessage.id = message._id.toString();
    dtoMessage.serverId = serverId;
    dtoMessage.groupId = groupId;
    return dtoMessage;
  }

}

export type ChannelMessageDocument = Document<any, any, ChannelMessage> & ChannelMessage;
export const ChannelMessageSchema = SchemaFactory.createForClass(ChannelMessage);
export default ChannelMessage;