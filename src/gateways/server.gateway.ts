import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import { UserServersData } from '../models/server.model';
import { ChannelType, TextChannel, VoiceChannel } from '../models/channel.model';

@WebSocketGateway()
export class ServerGateway implements OnGatewayConnection<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
  ) {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const response = await this.appService.getUserServersData(
      client.handshake.auth.sub,
    );
    client.data = { recvTransports: [], consumers: [] };

    await Promise.all(response.servers.map((server) =>
      client.join(`server_${server.id}`),
    ));

  }

  @SubscribeMessage('get_user_servers_data')
  async getUserServersData(client: Socket): Promise<UserServersData> {
    const response = await this.appService.getUserServersData(client.handshake.auth.sub);

    response.servers.forEach(server => {
      server.channels.forEach(this.processChannel(this.server));
      server.groups.forEach(group =>
        group.channels.forEach(this.processChannel(this.server)),
      );
    });
    return response;
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
    client.join(`server_${result.servers[0].id}`);
    return result;
  }

  @SubscribeMessage('create_invitation')
  async createInvitation(client: Socket, { serverId }) {
    return { invitation: await this.appService.createInvitation(client.handshake.auth.sub, serverId) };
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
    const newMember = result.servers.map(server => server.members).flat()
      .find((member) => member.userId === client.handshake.auth.sub);
    const newUser = result.users
      .find((user) => user.id === client.handshake.auth.sub);
    const serverId = result.servers[0].id;
    result.servers[0].channels.forEach(this.processChannel(this.server));
    result.servers[0].groups.forEach(group =>
      group.channels.forEach(this.processChannel(this.server)),
    );

    client.join(`server_${serverId}`);
    client.to(`server_${serverId}`).emit('new_member', {
      member: newMember,
      user: newUser,
    });

    return result;
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

  private processChannel(gateway: Server) {
    return (channel: VoiceChannel & TextChannel) => {
      if (channel.type === ChannelType.Text) {
        channel.messages = [];
      } else if (channel.type === ChannelType.Voice) {
        const room = gateway.of('/').adapter.rooms.get(`channel_${channel.id}`);
        channel.users = [];
        if (room === undefined) return;
        channel.users = Array.from(room)
          .map(socketId => ({ socketId, userId: gateway.sockets.sockets.get(socketId).handshake.auth.sub }));
      }
    };
  }
}
