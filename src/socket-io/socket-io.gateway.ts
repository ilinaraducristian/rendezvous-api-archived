import { BaseWsExceptionFilter, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import SocketIoServerEvents from "../dtos/SocketIoServerEvents";
import { MembersService } from "../members/members.service";
import { SocketIoService } from "./socket-io.service";
import { Keycloak } from "keycloak-connect";
import { KEYCLOAK_INSTANCE } from "nest-keycloak-connect";
import { Inject, UseFilters } from "@nestjs/common";
import { Server as SocketIoServer } from "socket.io";

@WebSocketGateway(3101, { cors: ["*"] })
class SocketIoGateway implements OnGatewayInit<SocketIoServer>, OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  constructor(
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService,
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: Keycloak
  ) {}

  afterInit(server: SocketIoServer) {
    this.socketIoService.socketIoServer = server;
  }
  async handleConnection(client: Socket) {
    const access_token = client.handshake.auth.token;
    let userId: string;

    try {
      if (access_token === undefined || access_token === null) {
        throw new Error("Unauthorized");
      }
      const grant = await this.keycloak.grantManager.createGrant({ access_token });
      const validatedAccessToken = await this.keycloak.grantManager.validateAccessToken(grant.access_token);
      if (validatedAccessToken !== grant.access_token) {
        throw new Error("Unauthorized");
      }
      const user = JSON.parse(Buffer.from(access_token.split(".")[1], "base64").toString());
      userId = client.handshake.auth.userId = user.sub;
    } catch (e) {
      client.disconnect(true);
      return;
    }
    const servers = await this.membersService.getServers(userId);
    client.join(servers.map((server) => server._id.toString()));
  }

  async handleDisconnect(client: Socket) {
    // const userId = client.handshake.auth.userId;
    // const servers = await this.membersService.getServers(userId);
    // servers.forEach((server) => {
    //   client.to(server.id).emit(SocketIoServerEvents.userOffline, userId);
    // });
  }
}

export default SocketIoGateway;
