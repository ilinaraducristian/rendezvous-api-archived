import { Module } from "@nestjs/common";
import { FriendshipMessagesController } from "./friendship-messages.controller";

@Module({
  controllers: [FriendshipMessagesController]
})
export class FriendshipMessagesModule {
}
