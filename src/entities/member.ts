import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import MemberDTO from "../dtos/member";

@Schema()
export class Member {

  _id: string = "";

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Server" })
  serverId: string;

  static toDTO(member: Member & {id?: string}): MemberDTO {
    return {
      id: member.id,
      userId: member.userId,
      serverId: member.serverId
    };
  }

}

export type MemberDocument = Member & Document;
export const MemberSchema = SchemaFactory.createForClass(Member);