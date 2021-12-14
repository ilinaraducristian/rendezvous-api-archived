import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ChannelType from "../dtos/channel-type";
import * as mongoose from "mongoose";
import ChannelDTO from "../dtos/channel";

@Schema()
export class Channel {

  _id: string = "";

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: "Group" })
  groupId: string | null;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ required: true })
  type: ChannelType;

  static toDTO(channel: Channel & { id?: string }): ChannelDTO {
    return {
      id: channel.id.toString(),
      serverId: channel.serverId.toString(),
      groupId: channel.groupId?.toString() ?? null,
      name: channel.name,
      order: channel.order,
      type: channel.type
    };
  }

}

export type ChannelDocument = Channel & Document;
export const ChannelSchema = SchemaFactory.createForClass(Channel);