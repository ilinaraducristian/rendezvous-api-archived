import { Module } from "@nestjs/common";
import { ServersController } from "./servers.controller";
import { GroupsModule } from "../groups/groups.module";
import { ChannelsModule } from "../channels/channels.module";
import { ServersService } from "./servers.service";
import MongooseModules from "../MongooseModules";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    SocketIoModule,
    MembersModule,
    GroupsModule,
    ChannelsModule,
    MongooseModules
  ],
  controllers: [ServersController],
  providers: [ServersService]
})
export class ServersModule {
}
