import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';

@WebSocketGateway()
export class ChannelGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
  ) {
  }

  @SubscribeMessage('join_voice-channel')
  async joinVoiceChannel(client: Socket, { channelId, serverId }: { serverId: number, channelId: number }) {
    await client.join(`channel_${channelId}`);
    client.to(`server_${serverId}`).emit('user_joined_voice-channel', {
      channelId,
      socketId: client.id,
      userId: client.handshake.auth.sub,
    });
    const room = this.server.of('/').adapter.rooms.get(`channel_${channelId}`);
    if (room === undefined) return [];
    return Array.from(room)
      .map(socketId => ({
        channelId,
        socketId,
        userId: this.server.sockets.sockets.get(socketId).handshake.auth.sub as string,
      }));
  }

  @SubscribeMessage('move_channel')
  async moveChannel(client: Socket, payload: { serverId: number, channelId: number, groupId: number | null, order: number }) {
    await this.appService.moveChannel(client.handshake.auth.token, payload);
    client.to(`server_${payload.serverId}`).emit('channel_moved', payload);
  }

}
