import { Module } from "@nestjs/common";
import { ServersController } from "./servers.controller";
import { ServersService } from "./servers.service";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MembersModule } from "../members/members.module";
import { MongooseModule } from "@nestjs/mongoose";
import Server, { ServerSchema } from "../entities/server";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Server.name, schema: ServerSchema }
    ]),
    MembersModule,
    SocketIoModule
  ],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [
    MembersModule,
    SocketIoModule,
    ServersService
  ]
})
export class ServersModule {
}
