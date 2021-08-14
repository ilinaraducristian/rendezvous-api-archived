import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';

@WebSocketGateway()
export class MessageGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
  ) {
  }

  @SubscribeMessage('edit_message')
  async editMessage(client: Socket, {
    serverId,
    channelId,
    messageId,
    text,
  }: { serverId: number, channelId: number, messageId: number, text: string }) {
    const response = await this.appService.editMessage(client.handshake.auth.sub, messageId, text);
    client.to(`server_${serverId}`).emit('message_edited', { serverId, channelId, messageId, text });
    return response;
  }

  @SubscribeMessage('delete_message')
  async deleteMessage(client: Socket, {
    serverId,
    channelId,
    messageId,
  }: { serverId: number, channelId: number, messageId: number }) {
    const response = await this.appService.deleteMessage(client.handshake.auth.sub, messageId);
    client.to(`server_${serverId}`).emit('message_deleted', { serverId, channelId, messageId });
    return response;
  }

}
