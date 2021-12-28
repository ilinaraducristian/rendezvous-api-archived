import { Module } from "@nestjs/common";
import { ServersController } from "./servers.controller";
import { ServersService } from "./servers.service";
import { SocketIoModule } from "../socket-io/socket-io.module";
import { MongooseModule } from "@nestjs/mongoose";
import Server, { ServerSchema } from "../entities/server";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Server.name, schema: ServerSchema }
    ]),
    SocketIoModule
  ],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [
    SocketIoModule,
    ServersService
  ]
})
export class ServersModule {
}
