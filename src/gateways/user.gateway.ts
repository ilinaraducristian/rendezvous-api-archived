import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserServersData } from '../models/server.model';
import { ChannelService } from 'src/services/channel/channel.service';
import { UserService } from 'src/services/user/user.service';

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const response = await this.userService.getUserData(
      client.handshake.auth.sub,
    );
    client.data = { recvTransports: [], consumers: [] };

    await Promise.all(response.servers.map((server) =>
      client.join(`server_${server.id}`),
    ));

  }

  @SubscribeMessage('get_user_data')
  async getUserData(client: Socket): Promise<UserServersData> {
    const response = await this.userService.getUserData(client.handshake.auth.sub);

    response.servers.forEach(server => {
      server.channels.forEach(this.channelService.processChannel(this.server));
      server.groups.forEach(group =>
        group.channels.forEach(this.channelService.processChannel(this.server)),
      );
    });
    return response;
  }

}
