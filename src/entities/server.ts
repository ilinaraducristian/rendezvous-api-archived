import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Channel } from "./channel";
import * as mongoose from "mongoose";
import { Group } from "./group";
import { Member } from "./member";
import ServerDTO from "../dtos/server";

@Schema()
export class Server {

  _id: string = '';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], default: [] })
  channels: Channel[];

  @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], default: [] })
  groups: Group[];

  @Prop({ required: true, type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }], default: [] })
  members: Member[];

  static toDTO(server: Server & {id?: string}): ServerDTO {
    return {
      id: server.id,
      name: server.name,
      order: -1,
      channels: server.channels.map(channel => Channel.toDTO(channel)),
      groups: server.groups.map(group => Group.toDTO(group)),
      members: server.members.map(member => Member.toDTO(member)),
    }
  }

}

export type ServerDocument = Server & Document;
export const ServerSchema = SchemaFactory.createForClass(Server);
