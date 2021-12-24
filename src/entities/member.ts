import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import MemberDTO from "../dtos/member";

@Schema()
class Member {

  _id: string = "";

  @Prop({ required: true })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  @Prop({ default: 0 })
  order: number;

  static toDTO(member: Member & { id?: string }): MemberDTO {
    return {
      id: member.id.toString(),
      userId: member.userId,
      serverId: member.serverId.toString()
    };
  }

}

export type MemberDocument = Member & Document;
export const MemberSchema = SchemaFactory.createForClass(Member);
export default Member;