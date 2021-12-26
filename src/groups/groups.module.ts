import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { ServersModule } from "../servers/servers.module";

@Module({
  imports: [
    ServersModule
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [
    ServersModule,
    GroupsService
  ]
})
export class GroupsModule {
}
