import { Prop, Schema } from "@nestjs/mongoose";
import Reaction from "./reaction";

@Schema()
class Message {

  _id?: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: [] })
  files: string[];

  @Prop({ default: [] })
  reactions: Reaction[];

}

export default Message;