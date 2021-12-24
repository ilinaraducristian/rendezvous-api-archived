import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { MessagesModule } from "../messages/messages.module";
import { SocketIoService } from "../socket-io/socket-io.service";

@Module({
  imports: [
    MessagesModule,
    MongooseModules
  ],
  controllers: [ChannelsController],
  providers: [ServersService, GroupsService, ChannelsService, SocketIoService]
})
export class ChannelsModule {
}
