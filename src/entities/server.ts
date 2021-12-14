import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ServerDTO from "../dtos/server";
import * as mongoose from "mongoose";
import { Group } from "./group";
import { Channel } from "./channel";
import { Member } from "./member";

@Schema()
export class Server {

  _id: string = "";

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  invitation: string | null;

  @Prop({ default: null })
  invitation_expiration_date: Date | null;

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }] })
  channels: Channel[];

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }] })
  groups: Group[];

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }] })
  members: Member[];

  static toDTO(server: Server & { id?: string }): ServerDTO {
    return {
      id: server.id,
      name: server.name,
      order: -1,
      invitation: server.invitation,
      invitation_exp: server.invitation_expiration_date?.toISOString() ?? null,
      channels: [],
      groups: [],
      members: []
    };
  }

}

export type ServerDocument = Server & Document;
export const ServerSchema = SchemaFactory.createForClass(Server);
