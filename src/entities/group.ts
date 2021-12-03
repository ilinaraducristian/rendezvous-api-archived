import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Channel } from "./channel";
import GroupDTO from "../dtos/group";


@Schema()
export class Group {

  _id: string = "";

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], default: [] })
  channels: Channel[];

  static toDTO(group: Group & {id?: string}): GroupDTO {
    return {
      id: group.id,
      serverId: group.serverId.toString(),
      name: group.name,
      channels: group.channels.map(channel => Channel.toDTO(channel))
    }
  }

}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);