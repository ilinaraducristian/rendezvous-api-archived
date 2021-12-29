import { Module } from "@nestjs/common";
import { FriendshipsService } from "./friendships.service";
import { FriendshipsController } from "./friendships.controller";
import Friendship, { FriendshipSchema } from "../entities/friendship";
import { MongooseModule } from "@nestjs/mongoose";
import FriendshipMessage, { FriendshipMessageSchema } from "../entities/friendship-message";
import { FriendshipsMessagesService } from "./friendships-messages.service";
import { FriendshipsMessagesController } from "./friendships-messages.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
      { name: FriendshipMessage.name, schema: FriendshipMessageSchema }
    ])
  ],
  providers: [FriendshipsService, FriendshipsMessagesService],
  controllers: [FriendshipsController, FriendshipsMessagesController]
})
export class FriendshipsModule {
}
