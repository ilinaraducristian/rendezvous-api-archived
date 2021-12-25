import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import MongooseModules from "../MongooseModules";
import { MessagesModule } from "../messages/messages.module";
import { MembersModule } from "../members/members.module";
import { ChannelsService } from "./channels.service";
import { SocketIoModule } from "../socket-io/socket-io.module";

@Module({
  imports: [
    SocketIoModule,
    MembersModule,
    MessagesModule,
    MongooseModules
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {
}
