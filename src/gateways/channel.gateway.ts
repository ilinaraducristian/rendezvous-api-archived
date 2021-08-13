import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import Message from '../models/message.model';

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

  @SubscribeMessage('get_messages')
  async getMessages(client: Socket, { channelId, serverId, offset }) {
    return await this.appService.getMessages(client.handshake.auth.sub, serverId, channelId, offset);
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    client: Socket,
    payload: { channelId: number; message: string },
  ): Promise<Message> {
    const message = await this.appService.sendMessage(
      client.handshake.auth.sub,
      payload.channelId,
      payload.message,
    );
    client.to(`server_${message.serverId}`).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('move_channel')
  async moveChannel(client: Socket, payload: { serverId: number, channelId: number, groupId: number | null, order: number }) {
    await this.appService.moveChannel(client.handshake.auth.token, payload);
    client.to(`server_${payload.serverId}`).emit('channel_moved', payload);
  }

}
