import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChannelService } from '../services/channel/channel.service';

import Socket from '../models/socket';
import {
  ChannelType,
  JoinVoiceChannelRequest,
  JoinVoiceChannelResponse,
  MoveChannelRequest,
  MoveChannelResponse,
  NewChannelRequest,
  NewChannelResponse,
} from '../dtos/channel.dto';

@WebSocketGateway()
export class ChannelGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly channelService: ChannelService,
  ) {
  }

  @SubscribeMessage('join_voice_channel')
  async joinVoiceChannel(client: Socket, {
    serverId,
    channelId,
  }: JoinVoiceChannelRequest): Promise<JoinVoiceChannelResponse> {
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

  @SubscribeMessage('create_channel')
  async createChannel(client: Socket, payload: NewChannelRequest): Promise<NewChannelResponse> {
    const channelId = await this.channelService.createChannel(
      client.handshake.auth.sub,
      payload.serverId,
      payload.groupId,
      ChannelType.Text,
      payload.channelName,
    );
    const channel = {
      id: channelId,
      serverId: payload.serverId,
      groupId: payload.groupId,
      type: ChannelType.Text,
      name: payload.channelName,
    };
    client.to(`server_${payload.serverId}`).emit('new_channel', channel);
    return { channelId };
  }

  @SubscribeMessage('move_channel')
  async moveChannel(client: Socket, payload: MoveChannelRequest): Promise<MoveChannelResponse> {
    const serverChannels = await this.channelService.moveChannel(client.handshake.auth.token, payload);
    const channels = serverChannels.map(({ id, order, group_id: groupId }) => ({ id, groupId, order }));
    client.to(`server_${payload.serverId}`).emit('channels_moved', { channels });
    return { channels };
  }

}
