import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
class Message {

  _id?: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  timestamp: Date;

}

export default Message;