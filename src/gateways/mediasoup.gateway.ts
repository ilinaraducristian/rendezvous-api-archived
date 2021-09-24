import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AppService } from '../services/app/app.service';
import { Router } from 'mediasoup/lib/Router';
import Socket from '../models/socket';
import {
  ConnectTransportRequest,
  CreateConsumerRequest,
  CreateProducerRequest,
  CreateTransportRequest,
  CreateTransportResponse,
  ResumeConsumerRequest,
} from '../dtos/mediasoup.dto';
import { UseInterceptors } from '@nestjs/common';
import { EmptyResponseInterceptor } from '../empty-response.interceptor';

@WebSocketGateway()
@UseInterceptors(EmptyResponseInterceptor)
export class MediasoupGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly appService: AppService,
    private readonly router: Router,
  ) {
  }

  @SubscribeMessage('pause_producer')
  async pauseProducer(client: Socket) {
    await client.data.producer?.pause();
  }

  @SubscribeMessage('resume_producer')
  async resumeProducer(client: Socket) {
    await client.data.producer?.resume();
  }

  @SubscribeMessage('get_router_capabilities')
  getRouterCapabilities() {
    return { routerRtpCapabilities: this.router.rtpCapabilities };
  }

  @SubscribeMessage('create_transport')
  async createTransport(client: Socket, { type }: CreateTransportRequest): Promise<CreateTransportResponse> {
    const transport = await this.router.createWebRtcTransport(global.webRtcTransportOptions);
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
  async connectSendTransport(client: Socket, { type, id, dtlsParameters }: ConnectTransportRequest) {
    if (type === 'send') {
      await client.data.sendTransport.connect({ dtlsParameters });
    } else if (type === 'recv') {
      await client.data.recvTransports.find(transport => transport.id === id).connect({ dtlsParameters });
    }
  }

  @SubscribeMessage('create_producer')
  async createProducer(client, payload: CreateProducerRequest) {
    client.data.producer = await client.data.sendTransport.produce(payload);
    return { id: client.data.producer.id };
  }

  @SubscribeMessage('create_consumer')
  async createConsumer(client: Socket, { transportId, socketId, ...rtpCapabilities }: CreateConsumerRequest) {
    const producerId = this.server.sockets.sockets.get(socketId).data.producer.id;
    const consumer = await client.data.recvTransports
      .find(transport => transport.id === transportId)
      .consume({ producerId, ...rtpCapabilities, paused: true });
    client.data.consumers.push(consumer);
    consumer.on('producerpause', () => {
      consumer.pause();
    });
    consumer.on('producerresume', () => {
      consumer.resume();
    });
    consumer.observer.on('pause', () => {
      this.server.to(client.id).emit('consumer_pause', { consumerId: consumer.id });
    });
    consumer.observer.on('resume', () => {
      this.server.to(client.id).emit('consumer_resume', { consumerId: consumer.id });
    });
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
  async resumeConsumer(client: Socket, { id }: ResumeConsumerRequest) {
    await client.data.consumers.find(consumer => consumer.id === id).resume();
  }

}
