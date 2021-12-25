import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import MongooseModules from "../MongooseModules";
import { GroupChannelMessagesModule } from "../messages/group-channel-messages.module";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    SocketIoModule,
    MembersModule,
    GroupChannelMessagesModule,
    MongooseModules
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class GroupChannelsModule {
}
