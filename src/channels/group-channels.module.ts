import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { GroupChannelMessagesModule } from "../messages/group-channel-messages.module";
import { SocketIoService } from "../socket-io/socket-io.service";

@Module({
  imports: [
    GroupChannelMessagesModule,
    MongooseModules
  ],
  controllers: [ChannelsController],
  providers: [ServersService, GroupsService, ChannelsService, SocketIoService]
})
export class GroupChannelsModule {
}
