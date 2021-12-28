import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { GroupsModule } from "../groups/groups.module";

@Module({
  imports: [GroupsModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [
    GroupsModule,
    ChannelsService
  ]
})
export class ChannelsModule {
}
