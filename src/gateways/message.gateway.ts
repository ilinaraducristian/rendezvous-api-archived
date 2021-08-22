import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import Message from '../models/message.model';

@WebSocketGateway()
export class MessageGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
  ) {
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    client: Socket,
    payload: { channelId: number; message: string, isReply: boolean, replyId: number | null, image: string | null },
  ): Promise<Message> {
    const message = await this.appService.sendMessage(
      client.handshake.auth.sub,
      payload.channelId,
      payload.message,
      payload.isReply,
      payload.replyId,
      payload.image,
    );
    client.to(`server_${message.serverId}`).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('get_messages')
  getMessages(client: Socket, { channelId, serverId, offset }) {
    return this.appService.getMessages(client.handshake.auth.sub, serverId, channelId, offset);
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
