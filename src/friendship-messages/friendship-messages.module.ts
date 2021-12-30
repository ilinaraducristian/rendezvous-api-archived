import { Module } from "@nestjs/common";
import { FriendshipsModule } from "../friendships/friendships.module";
import { FriendshipMessagesService } from "./friendship-messages.service";
import { FriendshipMessagesController } from "./friendship-messages.controller";
import { MongooseModule } from "@nestjs/mongoose";
import FriendshipMessage, { FriendshipMessageSchema } from "../entities/friendship-message";

@Module({
  imports: [
    FriendshipsModule,
    MongooseModule.forFeature([
      { name: FriendshipMessage.name, schema: FriendshipMessageSchema }
    ])
  ],
  providers: [FriendshipMessagesService],
  controllers: [FriendshipMessagesController]
})
export class FriendshipMessagesModule {
}
