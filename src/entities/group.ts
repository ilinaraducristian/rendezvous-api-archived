import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import Channel, { ChannelSchema } from "./channel";
import { Document } from "mongoose";

@Schema()
class Group {

  _id?: string = "";

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: [], type: [ChannelSchema] })
  channels: Channel[];

}

export type GroupDocument = Document<any, any, Group> & Group;
export const GroupSchema = SchemaFactory.createForClass(Group);
export default Group;