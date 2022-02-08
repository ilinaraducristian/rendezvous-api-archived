import { Module } from "@nestjs/common";
import { FriendshipsController } from "./friendships.controller";

@Module({
  controllers: [FriendshipsController],
})
export class FriendshipsModule {}
