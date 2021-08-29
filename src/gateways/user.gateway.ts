import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserServersData } from '../models/server.model';
import { UserService } from '../services/user/user.service';
import { ChannelService } from '../services/channel/channel.service';

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
    const userServersIds = await this.userService.getUserServersIds(
      client.handshake.auth.sub,
    );
    client.data = { recvTransports: [], consumers: [] };
    await Promise.all(userServersIds.map((id) =>
      client.join(`server_${id}`),
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

  @SubscribeMessage('send_friend_request')
  async sendFriendRequest(client: Socket, payload: { username: string }): Promise<{ id: number, userId: string }> {
    const userId = await this.userService.getUserIdByUsername(payload.username);
    if (userId === undefined) throw new Error('User not found');
    const response = await this.userService.sendFriendRequest(client.handshake.auth.sub, userId);
    const sockets = this.server.sockets.sockets.entries();
    for (const [, socket] of sockets) {
      if (socket.handshake.auth.sub === userId) {
        client.to(socket.id).emit('new_friend_request', { userId: client.handshake.auth.sub });
        break;
      }
    }
    return { id: response, userId };
  }

  @SubscribeMessage('accept_friend_request')
  async acceptFriendRequest(client: Socket, payload: { friendRequestId: number }) {
    const userId = client.handshake.auth.sub;
    await this.userService.acceptFriendRequest(userId, payload.friendRequestId);
    const sockets = this.server.sockets.sockets.entries();
    for (const [, socket] of sockets) {
      if (socket.handshake.auth.sub === userId) {
        client.to(socket.id).emit('friend_request_accepted', { friendRequestId: payload.friendRequestId });
        break;
      }
    }
    return 0;
  }

}
