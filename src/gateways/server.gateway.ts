import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ServerService } from '../services/server/server.service';
import { ChannelService } from '../services/channel/channel.service';
import Socket from '../models/socket';
import {
  JoinServerRequest,
  JoinServerResponse,
  MoveServerRequest,
  MoveServerResponse,
  NewInvitationRequest,
  NewInvitationResponse,
  NewServerRequest,
  NewServerResponse,
  UpdateServerImageRequest,
} from '../dtos/server.dto';
import { UseInterceptors } from '@nestjs/common';
import { EmptyResponseInterceptor } from '../empty-response.interceptor';

@WebSocketGateway()
@UseInterceptors(EmptyResponseInterceptor)
export class ServerGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly serverService: ServerService,
    private readonly channelService: ChannelService,
  ) {
  }

  @SubscribeMessage('create_server')
  async createServer(client: Socket, payload: NewServerRequest): Promise<NewServerResponse> {
    const result = await this.serverService.createServer(
      client.handshake.auth.sub,
      payload.name,
    );
    result.servers[0].channels.forEach(this.channelService.processChannel(this.server));
    result.servers[0].groups.forEach(group =>
      group.channels.forEach(this.channelService.processChannel(this.server)),
    );
    client.join(`server_${result.servers[0].id}`);
    return result;
  }

  @SubscribeMessage('create_invitation')
  async createInvitation(client: Socket, { serverId }: NewInvitationRequest): Promise<NewInvitationResponse> {
    return { invitation: await this.serverService.createInvitation(client.handshake.auth.sub, serverId) };
  }

  @SubscribeMessage('join_server')
  async joinServer(client: Socket, payload: JoinServerRequest): Promise<JoinServerResponse> {
    const result = await this.serverService.joinServer(
      client.handshake.auth.sub,
      payload.invitation,
    );
    const newMember = result.servers.map(server => server.members).flat()
      .find((member) => member.userId === client.handshake.auth.sub);
    const newUser = result.users
      .find((user) => user.id === client.handshake.auth.sub);
    const serverId = result.servers[0].id;
    result.servers[0].channels.forEach(this.channelService.processChannel(this.server));
    result.servers[0].groups.forEach(group =>
      group.channels.forEach(this.channelService.processChannel(this.server)),
    );

    await client.join(`server_${serverId}`);
    client.to(`server_${serverId}`).emit('new_member', {
      member: newMember,
      user: newUser,
    });
    return result;
  }

  @SubscribeMessage('update_server_image')
  async updateImage(client: Socket, payload: UpdateServerImageRequest) {
    await this.serverService.updateImage(client.handshake.auth.sub, payload);
  }

  @SubscribeMessage('move_server')
  async moveServer(client: Socket, payload: MoveServerRequest): Promise<MoveServerResponse> {
    const userServers = await this.serverService.moveServer(client.handshake.auth.sub, payload);
    console.log(userServers);
    return { servers: userServers.map(({ id, order }) => ({ id, order })) };
  }

  @SubscribeMessage('delete_server')
  async deleteServer(client: Socket, payload: { serverId: number }) {
    await this.serverService.deleteServer(client.handshake.auth.sub, payload.serverId);
    this.server.to(`server_${payload.serverId}`).emit('server_deleted', { serverId: payload.serverId });
  }

}
