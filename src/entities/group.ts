import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import Channel, { ChannelDocument, ChannelSchema } from "./channel";
import { Document } from "mongoose";
import { ServerDocument } from "./server";

@Schema()
class Group {

  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: [], type: [ChannelSchema] })
  channels: Channel[];

  server?: ServerDocument;

  static toDTO(group: GroupDocument, serverId: string) {
    const dtoGroup: any = group.toObject();
    delete dtoGroup._id;
    dtoGroup.id = group._id.toString();
    dtoGroup.serverId = serverId;
    dtoGroup.channels = group.channels.map((channel: ChannelDocument) =>
      Channel.toDTO(channel, serverId, dtoGroup.id)
    );
    return dtoGroup;
  }

}

export type GroupDocument = Document<any, any, Group> & Group;
export const GroupSchema = SchemaFactory.createForClass(Group);
export default Group;