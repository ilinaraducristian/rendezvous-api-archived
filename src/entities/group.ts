import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import GroupDTO from "../dtos/group";
import { Channel } from "./channel";


@Schema()
export class Group {

  _id: string = "";

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }] })
  channels: Channel[];

  static toDTO(group: Group & { id?: string }): GroupDTO {
    return {
      id: group.id.toString(),
      serverId: group.serverId.toString(),
      name: group.name,
      order: group.order,
      channels: []
    };
  }

}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);