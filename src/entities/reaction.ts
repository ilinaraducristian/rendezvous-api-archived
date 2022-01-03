import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import ReactionDTO from "../dtos/reaction";
import { Document } from "mongoose";

@Schema()
class Reaction {

  _id?: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  serverEmoji?: boolean;

  @Prop({ required: true })
  emoji: string;

  static toDTO(reaction: ReactionDocument): ReactionDTO {
    const dtoReaction: any = reaction.toObject();
    delete dtoReaction._id;
    return dtoReaction;
  }

}

export type ReactionDocument = Document<any, any, Reaction> & Reaction;
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
export default Reaction;
