import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ServerDTO from "../dtos/server";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import { Member } from "./member";
import Group, { GroupDocument, GroupSchema } from "./group";
import { ChannelDocument } from "./channel";

@Schema()
export class Server {

  _id: string = "";

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  invitation: string | null;

  @Prop({ default: null })
  invitation_exp: Date | null;

  @Prop({ default: [], type: [GroupSchema] })
  groups: Group[];

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }] })
  members: Member[];

  static toDTO(server: ServerDocument): ServerDTO {
    const dtoServer: any = server.toObject();
    delete dtoServer._id;
    delete dtoServer.__v;
    dtoServer.id = server._id.toString();
    dtoServer.invitation_exp = server.invitation_exp?.toISOString() ?? null;
    dtoServer.groups = server.groups.map((group: GroupDocument) => {
      const dtoGroup: any = group.toObject();
      delete dtoGroup._id;
      dtoGroup.id = group._id.toString();
      dtoGroup.serverId = dtoServer.id;
      dtoGroup.channels = group.channels.map((channel: ChannelDocument) => {
        const dtoChannel: any = channel.toObject();
        delete dtoChannel._id;
        dtoChannel.id = channel._id.toString();
        dtoChannel.serverId = dtoServer.id;
        dtoChannel.groupId = dtoGroup.id;
        return dtoChannel;
      });
      return dtoGroup;
    });
    dtoServer.members = server.members.map(memberId => memberId.toString());
    return dtoServer;
  }

}

export type ServerDocument = Document<any, any, Server> & Server;
export const ServerSchema = SchemaFactory.createForClass(Server);
