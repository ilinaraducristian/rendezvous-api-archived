import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ChannelType from "../dtos/channel-type";
import { Document } from "mongoose";

@Schema()
class Channel {

  _id?: string = "";

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ required: true })
  type: ChannelType;

}

export type ChannelDocument = Document<any, any, Channel> & Channel;
export const ChannelSchema = SchemaFactory.createForClass(Channel);
export default Channel;