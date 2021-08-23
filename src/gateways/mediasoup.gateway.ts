import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from 'src/services/app/app.service';
import { Router } from 'mediasoup/lib/Router';
import { DtlsParameters } from 'mediasoup/lib/WebRtcTransport';

const webRtcTransportOptions = {
  listenIps: [{ ip: '192.168.1.4' }],
  enableTcp: true,
  preferUdp: true,
};

@WebSocketGateway()
export class MediasoupGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
    private readonly router: Router,
  ) {
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

}
