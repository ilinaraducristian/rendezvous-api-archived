import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import MongooseModules from "../MongooseModules";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [
    SocketIoModule,
    MembersModule,
    MongooseModules
  ],
  controllers: [MessagesController],
  providers: [MessagesService]
})
export class MessagesModule {
}
