import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import Message from "./message";

@Schema()
class FriendshipMessage extends Message {

  @Prop({ type: Types.ObjectId, ref: "Friendship" })
  friendshipId: string;

  static toDTO(message: FriendshipMessageDocument) {
    const dtoMessage: any = message.toObject();
    delete dtoMessage._id;
    dtoMessage.id = message._id.toString();
    return dtoMessage;
  }

}

export type FriendshipMessageDocument = Document<any, any, FriendshipMessage> & FriendshipMessage;
export const FriendshipMessageSchema = SchemaFactory.createForClass(FriendshipMessage);
export default FriendshipMessage;