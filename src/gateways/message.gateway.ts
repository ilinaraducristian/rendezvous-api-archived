import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from '../services/message/message.service';
import { FriendshipService } from '../services/friendship/friendship.service';
import Socket from '../models/socket';
import {
  DeleteMessagesRequest,
  EditMessagesRequest,
  GetMessagesRequest,
  Message,
  NewMessageRequest,
} from '../dtos/message.dto';
import getSocketByUserId from '../util/get-socket';

@WebSocketGateway()
export class MessageGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly friendshipService: FriendshipService,
  ) {
  }

  @SubscribeMessage('send_message')
  async sendMessage(client: Socket, payload: NewMessageRequest): Promise<Message> {
    const message = await this.messageService.sendMessage(
      client.handshake.auth.sub,
      payload,
    );
    if (payload.friendshipId === null) {
      client.to(`server_${message.serverId}`).emit('new_message', message);
    } else {
      // get friendship
      const friendship = await this.friendshipService.getFriendshipById(payload.friendshipId);
      const friendId = friendship.user1_id === client.handshake.auth.sub ? friendship.user2_id : friendship.user1_id;
      const socket = getSocketByUserId(this.server, friendId);
      if (socket !== undefined) {
        client.to(socket.id).emit('new_message', message);
      }
    }
    return message;
  }

  @SubscribeMessage('get_messages')
  getMessages(client: Socket, { friendshipId, serverId, channelId, offset }: GetMessagesRequest): Promise<Message[]> {
    return this.messageService.getMessages(client.handshake.auth.sub, friendshipId, serverId, channelId, offset);
  }

  @SubscribeMessage('edit_message')
  async editMessage(client: Socket, { serverId, channelId, messageId, text }: EditMessagesRequest) {
    const response = await this.messageService.editMessage(client.handshake.auth.sub, messageId, text);
    client.to(`server_${serverId}`).emit('message_edited', { serverId, channelId, messageId, text });
    return response;
  }

  @SubscribeMessage('delete_message')
  async deleteMessage(client: Socket, { serverId, channelId, messageId }: DeleteMessagesRequest) {
    const response = await this.messageService.deleteMessage(client.handshake.auth.sub, messageId);
    client.to(`server_${serverId}`).emit('message_deleted', { serverId, channelId, messageId });
    return response;
  }

}
