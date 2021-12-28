import { Module } from "@nestjs/common";
import SocketIoGateway from "./socket-io.gateway";
import { SocketIoService } from "./socket-io.service";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [MembersModule],
  providers: [SocketIoGateway, SocketIoService],
  exports: [
    MembersModule,
    SocketIoService
  ]
})
export class SocketIoModule {
}
