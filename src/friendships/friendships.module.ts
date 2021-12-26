import { Module } from "@nestjs/common";
import { FriendshipsService } from "./friendships.service";
import { FriendshipsController } from "./friendships.controller";
import Friendship, { FriendshipSchema } from "../entities/friendship";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema }
    ])
  ],
  providers: [FriendshipsService],
  controllers: [FriendshipsController]
})
export class FriendshipsModule {
}
