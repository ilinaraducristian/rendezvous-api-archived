import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import SocketIoEvents from "../dtos/SocketIoEvents";
import { MembersService } from "../members/members.service";
import { SocketIoService } from "./socket-io.service";

@WebSocketGateway()
class SocketIoGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {

  constructor(
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    // TODO verify token
    return;
    const token = client.handshake.auth.token;
    const userId = client.handshake.auth.userId;
    const servers = await this.membersService.getServers(userId);
    const serverIds = [];
    servers.forEach(server => {
      client.to(server.id).emit(SocketIoEvents.userOnline, userId);
      serverIds.push(server._id);
    });
    await client.join(serverIds);
    this.socketIoService.addSocketUserPair({ userId, socketId: client.id });
  }

  async handleDisconnect(client: Socket) {
    // TODO get user id from auth
    return;
    const userId = client.handshake.auth.userId;
    const servers = await this.membersService.getServers(userId);
    servers.forEach(server => {
      client.to(server.id).emit(SocketIoEvents.userOffline, userId);
    });
    this.socketIoService.removeSocketUserPair({ userId, socketId: client.id });
  }

}

export default SocketIoGateway;