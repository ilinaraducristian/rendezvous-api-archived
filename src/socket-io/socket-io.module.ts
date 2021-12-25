import { Module } from "@nestjs/common";
import SocketIoGateway from "./socket-io.gateway";
import { SocketIoService } from "./socket-io.service";

@Module({
  providers: [SocketIoGateway, SocketIoService]
})
export class SocketIoModule {
}
