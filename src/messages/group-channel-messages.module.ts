import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { ChannelsService } from "../channels/channels.service";
import { SocketIoService } from "../socket-io/socket-io.service";

@Module({
  imports: [MongooseModules],
  exports: [],
  controllers: [MessagesController],
  providers: [ServersService, GroupsService, ChannelsService, MessagesService, SocketIoService]
})
export class GroupChannelMessagesModule {}
