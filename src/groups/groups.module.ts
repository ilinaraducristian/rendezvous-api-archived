import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { GroupChannelsModule } from "../channels/group-channels.module";

@Module({
  imports: [
    GroupChannelsModule,
    MongooseModules
  ],
  controllers: [GroupsController],
  providers: [ServersService, GroupsService]
})
export class GroupsModule {
}
