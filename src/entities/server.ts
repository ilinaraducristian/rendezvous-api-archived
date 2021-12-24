import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ServerDTO from "../dtos/server";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import Member from "./member";
import Group, { GroupDocument, GroupSchema } from "./group";
import Invitation from "../dtos/invitation";

@Schema()
class Server {

  @Prop({ required: true })
  name: string;

  @Prop({ default: null, type: Object })
  invitation: Invitation | null;

  @Prop({ default: [], type: [GroupSchema] })
  groups: Group[];

  @Prop({ default: [], type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }] })
  members: Member[];

  static toDTO(server: ServerDocument): ServerDTO {
    const dtoServer: any = server.toObject();
    delete dtoServer._id;
    delete dtoServer.__v;
    dtoServer.id = server._id.toString();
    dtoServer.groups = server.groups.map((group: GroupDocument) =>
      Group.toDTO(group, dtoServer.id));
    dtoServer.members = server.members.map(memberId => memberId.toString());
    return dtoServer;
  }

}

export type ServerDocument = Document<any, any, Server> & Server;
export const ServerSchema = SchemaFactory.createForClass(Server);
export default Server;
