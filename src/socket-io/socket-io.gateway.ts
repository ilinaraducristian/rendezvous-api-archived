import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import SocketIoEvents from "../dtos/SocketIoEvents";
import { MembersService } from "../members/members.service";
import { SocketIoService } from "./socket-io.service";
import { Keycloak } from "keycloak-connect";
import { KEYCLOAK_INSTANCE } from "nest-keycloak-connect";
import { Inject } from "@nestjs/common";

@WebSocketGateway()
class SocketIoGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {

  constructor(
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService,
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: Keycloak
  ) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const jwt = client.handshake.auth.token;
    let userId: string;

    if (jwt === undefined || jwt === null) {
      throw new WsException("unauthorized");
    }

    try {
      const grant = await this.keycloak.grantManager.createGrant({ access_token: jwt });
      if ((await this.keycloak.grantManager.validateAccessToken(grant.access_token)) === grant.access_token) {
        const user = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString());
        userId = client.handshake.auth.userId = user.sub;
      }
    } catch (e) {
      console.error(e);
      throw new WsException("unauthorized");
    }
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
    const userId = client.handshake.auth.userId;
    const servers = await this.membersService.getServers(userId);
    servers.forEach(server => {
      client.to(server.id).emit(SocketIoEvents.userOffline, userId);
    });
    this.socketIoService.removeSocketUserPair({ userId, socketId: client.id });
  }

}

export default SocketIoGateway;