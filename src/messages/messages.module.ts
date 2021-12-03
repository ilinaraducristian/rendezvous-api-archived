import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { ChannelsService } from "../channels/channels.service";

@Module({
  imports: [MongooseModules],
  controllers: [MessagesController],
  providers: [ServersService, GroupsService, ChannelsService, MessagesService]
})
export class MessagesModule {}
