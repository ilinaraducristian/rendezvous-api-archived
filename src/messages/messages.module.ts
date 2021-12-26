import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { ServersModule } from "../servers/servers.module";
import { MongooseModule } from "@nestjs/mongoose";
import Message, { MessageSchema } from "../entities/message";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema }
    ]),
    ServersModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService]
})
export class MessagesModule {
}
