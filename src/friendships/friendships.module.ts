import { Module } from "@nestjs/common";
import { FriendshipsService } from "./friendships.service";
import { FriendshipsController } from "./friendships.controller";
import MongooseModules from "../MongooseModules";

@Module({
  imports: [MongooseModules],
  providers: [FriendshipsService],
  controllers: [FriendshipsController]
})
export class FriendshipsModule {
}
