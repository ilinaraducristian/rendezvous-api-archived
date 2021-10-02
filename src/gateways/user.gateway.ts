import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserService } from '../services/user/user.service';
import { ChannelService } from '../services/channel/channel.service';
import Socket from '../models/socket';
import { AcceptFriendRequest, SendFriendRequest, SendFriendRequestResponse, UserDataResponse } from '../dtos/user.dto';
import { UseInterceptors } from '@nestjs/common';
import { EmptyResponseInterceptor } from '../empty-response.interceptor';
import getSocketByUserId from '../util/get-socket';

@WebSocketGateway()
@UseInterceptors(EmptyResponseInterceptor)
export class UserGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {
  }

  handleDisconnect(client: Socket) {
    client.data.consumers.forEach(consumer => consumer.close());
    client.data.producer?.close();
    client.data.recvTransport?.close();
    client.data.sendTransport?.close();
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const userServersIds = await this.userService.getUserServersIds(
      client.handshake.auth.sub,
    );
    client.data = { consumers: [] };
    await Promise.all(userServersIds.map((id) =>
      client.join(`server_${id}`),
    ));
  }

  @SubscribeMessage('get_user_data')
  async getUserData(client: Socket): Promise<UserDataResponse> {
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
  async sendFriendRequest(client: Socket, payload: SendFriendRequest): Promise<SendFriendRequestResponse> {
    const userId = await this.userService.getUserIdByUsername(payload.username);
    if (userId === undefined) throw new Error('User not found');
    const response = await this.userService.sendFriendRequest(client.handshake.auth.sub, userId);
    const socket = getSocketByUserId(this.server, userId);
    if (socket !== undefined) {
      client.to(socket.id).emit('new_friend_request', {
        id: response,
        userId: client.handshake.auth.sub,
        incoming: true,
      });
    }
    return { id: response, userId };
  }

  @SubscribeMessage('accept_friend_request')
  async acceptFriendRequest(client: Socket, { friendRequestId }: AcceptFriendRequest) {
    const userId = client.handshake.auth.sub;
    await this.userService.acceptFriendRequest(userId, friendRequestId);
    const socket = getSocketByUserId(this.server, userId);
    if (socket === undefined) return;
    client.to(socket.id).emit('friend_request_accepted', { id: friendRequestId });
  }

}
