import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';
import { ChannelType, Message, TextChannel, UserServersData, VoiceChannel } from './types';
import { Router } from 'mediasoup/lib/Router';
import { DtlsParameters } from 'mediasoup/lib/WebRtcTransport';

const webRtcTransportOptions = {
  listenIps: [{ ip: '192.168.1.4' }],
  enableTcp: true,
  preferUdp: true,
};

@WebSocketGateway()
export class SocketIOGateway implements OnGatewayConnection<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
    private readonly router: Router,
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

  @SubscribeMessage('get_router_capabilities')
  getRouterCapabilities() {
    return { routerRtpCapabilities: this.router.rtpCapabilities };
  }

  @SubscribeMessage('create_transport')
  async createTransport(client: Socket, { type }: { type: string }) {
    const transport = await this.router.createWebRtcTransport(webRtcTransportOptions);
    if (type === 'send') {
      client.data.sendTransport = transport;
    } else if (type === 'recv') {
      client.data.recvTransports.push(transport);
    }
    return {
      transportParameters: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
      },
    };
  }

  @SubscribeMessage('connect_transport')
  async connectSendTransport(client, {
    type,
    dtlsParameters,
    id,
  }: { type: string, dtlsParameters: DtlsParameters, id: string }) {
    if (type === 'send') {
      await client.data.sendTransport.connect({ dtlsParameters });
    } else if (type === 'recv') {
      await client.data.recvTransports.find(transport => transport.id === id).connect({ dtlsParameters });
    }
    return 0;
  }

  @SubscribeMessage('create_producer')
  async createProducer(client, payload) {
    client.data.producer = await client.data.sendTransport.produce(payload);
    return { producerId: client.data.producer.id };
  }

  @SubscribeMessage('create_consumer')
  async createConsumer(client, { transportId, socketId, ...payload }) {
    const producerId = this.server.sockets.sockets.get(socketId).data.producer.id;
    const consumer = await client.data.recvTransports
      .find(transport => transport.id === transportId)
      .consume({ producerId, ...payload, paused: true });
    client.data.consumers.push(consumer);
    return {
      consumerParameters: {
        id: consumer.id,
        producerId,
        rtpParameters: consumer.rtpParameters,
        kind: consumer.kind,
        appData: consumer.appData,
      },
    };
  }

  @SubscribeMessage('resume_consumer')
  async resumeConsumer(client: Socket, { id }: { id: string }) {
    await client.data.consumers.find(consumer => consumer.id === id).resume();
    return 0;
  }

  @SubscribeMessage('join_voice-channel')
  async joinVoiceChannel(client: Socket, { channelId }: { serverId: number, channelId: number }) {
    await client.join(`channel_${channelId}`);
    this.server.emit('user_joined_voice-channel', {
      channelId,
      socketId: client.id,
      userId: client.handshake.auth.sub,
    });
    const room = this.server.of('/').adapter.rooms.get(`channel_${channelId}`);
    if (room === undefined) return [];
    return Array.from(room)
      .map(socketId => ({
        socketId,
        userId: this.server.sockets.sockets.get(socketId).handshake.auth.sub as string,
      }));
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

  @SubscribeMessage('get_messages')
  async getMessages(client: Socket, { channelId, serverId, offset }) {
    return await this.appService.getMessages(client.handshake.auth.sub, serverId, channelId, offset);
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
