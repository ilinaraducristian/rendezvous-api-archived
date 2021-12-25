import { MongooseModule } from "@nestjs/mongoose";
import Server, { ServerSchema } from "./entities/server";
import Member, { MemberSchema } from "./entities/member";
import { Message, MessageSchema } from "./entities/message";
import Friendship, { FriendshipSchema } from "./entities/friendship";

const MongooseModules = MongooseModule.forFeature([
  { name: Server.name, schema: ServerSchema },
  {
    name: Message.name,
    schema: MessageSchema
  },
  {
    name: Member.name,
    schema: MemberSchema
  },
  {
    name: Friendship.name,
    schema: FriendshipSchema
  }
]);

export default MongooseModules;