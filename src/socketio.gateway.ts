import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';
import { ChannelType, Message, UserServersData } from './types';

@WebSocketGateway()
export class SocketIOGateway implements OnGatewayConnection<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(private readonly appService: AppService) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const response = await this.appService.getUserServersData(
      client.handshake.auth.sub,
    );
    response.servers.forEach((server) => {
      client.join(`server_${server[0]}`);
    });
  }

  @SubscribeMessage('get_user_servers_data')
  async getUserServersData(client: Socket): Promise<UserServersData> {
    return await this.appService.getUserServersData(client.handshake.auth.sub);
  }

  @SubscribeMessage('create_server')
  async createServer(
    client: Socket,
    payload: { name: string },
  ): Promise<UserServersData> {
    const result = await this.appService.createServer(
      client.handshake.auth.sub,
      payload.name,
    );
    client.join(`server_${result.servers[0][1].id}`);
    return result;
  }

  @SubscribeMessage('join_server')
  async joinServer(
    client: Socket,
    payload: { invitation: string },
  ): Promise<UserServersData> {
    const result = await this.appService.joinServer(
      client.handshake.auth.sub,
      payload.invitation,
    );
    const newMember = result.members
      .map((member) => member[1])
      .find((member) => member.userId === client.handshake.auth.sub);
    const newUser = result.users
      .map((user) => user[1])
      .find((user) => user.id === client.handshake.auth.sub);
    const serverId = result.servers[0][0];

    client.join(`server_${serverId}`);
    client.to(`server_${serverId}`).emit('new_member', {
      member: newMember,
      user: newUser,
    });

    return result;
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    client: Socket,
    payload: { channelId: number; message: string },
  ): Promise<Message> {
    console.log('received');
    const message = await this.appService.sendMessage(
      client.handshake.auth.sub,
      payload.channelId,
      payload.message,
    );
    client.to(`server_${message.serverId}`).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('create_channel')
  async createChannel(
    client: Socket,
    payload: { serverId: number; groupId: number | null; channelName: string },
  ): Promise<{ channelId: number }> {
    const channelId = await this.appService.createChannel(
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

  @SubscribeMessage('create_group')
  async createGroup(
    client: Socket,
    payload: { serverId: number; groupName: string },
  ): Promise<number> {
    const groupId = await this.appService.createGroup(
      client.handshake.auth.sub,
      payload.serverId,
      payload.groupName,
    );
    const group = {
      id: groupId,
      serverId: payload.serverId,
      name: payload.groupName,
    };
    client.to(`server_${payload.serverId}`).emit('new_group', group);
    return groupId;
  }

}
