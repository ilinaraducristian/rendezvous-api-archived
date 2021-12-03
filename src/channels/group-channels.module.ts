import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { GroupChannelMessagesModule } from "../messages/group-channel-messages.module";

@Module({
  imports: [
    GroupChannelMessagesModule,
    MongooseModules
  ],
  controllers: [ChannelsController],
  providers: [ServersService, GroupsService, ChannelsService]
})
export class GroupChannelsModule {
}
