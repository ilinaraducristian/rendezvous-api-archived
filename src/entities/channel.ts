import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ChannelType from "../dtos/channel-type";
import * as mongoose from "mongoose";
import { Message } from "./message";
import ChannelDTO from "../dtos/channel";

@Schema()
export class Channel {

  _id: string = "";

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ default: null })
  groupId: string | null;

  @Prop({ required: true })
  type: ChannelType;

  @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], default: [] })
  messages: Message[];

  static toDTO(channel: Channel & { id?: string }): ChannelDTO {
    return {
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId.toString(),
      groupId: channel.groupId?.toString() ?? null,
      type: channel.type
    };
  }

}

export type ChannelDocument = Channel & Document;
export const ChannelSchema = SchemaFactory.createForClass(Channel);