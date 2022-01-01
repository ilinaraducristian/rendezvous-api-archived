import { Module } from "@nestjs/common";
import { ChannelMessagesController } from "./channel-messages.controller";

@Module({
  controllers: [ChannelMessagesController]
})
export class ChannelMessagesModule {
}
