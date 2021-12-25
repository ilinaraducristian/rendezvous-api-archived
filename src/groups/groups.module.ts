import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import MongooseModules from "../MongooseModules";
import { GroupChannelsModule } from "../channels/group-channels.module";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    SocketIoModule,
    MembersModule,
    GroupChannelsModule,
    MongooseModules
  ],
  controllers: [GroupsController],
  providers: [GroupsService]
})
export class GroupsModule {
}
