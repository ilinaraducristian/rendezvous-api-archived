import { Module } from "@nestjs/common";
import { ServersController } from "./servers.controller";
import { GroupsModule } from "../groups/groups.module";
import { ChannelsModule } from "../channels/channels.module";
import { ServersService } from "./servers.service";
import MongooseModules from "../MongooseModules";

@Module({
  imports: [
    GroupsModule,
    ChannelsModule,
    MongooseModules
  ],
  controllers: [
    ServersController
  ],
  providers: [ServersService],
  exports: []
})
export class ServersModule {
}
