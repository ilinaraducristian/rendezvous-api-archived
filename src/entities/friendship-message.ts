import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document } from "mongoose";

@Schema()
class FriendshipMessage {

  _id?: string;

  @Prop({ required: true, type: { type: mongoose.Schema.Types.ObjectId, ref: "Friendship" } })
  friendshipId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  timestamp: Date;

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