import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Router } from 'mediasoup/lib/Router';
import Socket from '../models/socket';
import {
  ConnectTransportRequest,
  CreateConsumerRequest,
  CreateConsumersResponse,
  CreateProducerRequest,
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

  @SubscribeMessage('create_transports')
  async createTransport(client: Socket): Promise<CreateTransportResponse> {
    const sendTransport = await this.router.createWebRtcTransport(global.webRtcTransportOptions);
    const recvTransport = await this.router.createWebRtcTransport(global.webRtcTransportOptions);
    client.data.sendTransport = sendTransport;
    client.data.recvTransport = recvTransport;
    return {
      sendTransportParameters: {
        id: sendTransport.id,
        iceParameters: sendTransport.iceParameters,
        iceCandidates: sendTransport.iceCandidates,
        dtlsParameters: sendTransport.dtlsParameters,
        sctpParameters: sendTransport.sctpParameters,
      },
      recvTransportParameters: {
        id: recvTransport.id,
        iceParameters: recvTransport.iceParameters,
        iceCandidates: recvTransport.iceCandidates,
        dtlsParameters: recvTransport.dtlsParameters,
        sctpParameters: recvTransport.sctpParameters,
      },
    };
  }

  @SubscribeMessage('connect_transport')
  async connectSendTransport(client: Socket, { type, dtlsParameters }: ConnectTransportRequest) {
    client.data[`${type}Transport`].connect({ dtlsParameters });
  }

  @SubscribeMessage('create_producer')
  async createProducer(client, payload: CreateProducerRequest) {
    client.data.producer = await client.data.sendTransport.produce(payload);
    return { id: client.data.producer.id };
  }

  @SubscribeMessage('close_producer')
  async closeProducer(client: Socket) {
    client.data.producer?.close();
    client.data.producer = undefined;
  }

  @SubscribeMessage('close_transports')
  async closeTransports(client: Socket) {
    client.data.recvTransport?.close();
    client.data.sendTransport?.close();
    client.data.recvTransport = undefined;
    client.data.sendTransport = undefined;
  }

  @SubscribeMessage('create_consumer')
  async createConsumer(client: Socket, { consumers }: CreateConsumerRequest): Promise<CreateConsumersResponse> {
    return Promise.all(consumers.map(async ({ socketId, ...rtpCapabilities }) => {
      const producerId = this.server.sockets.sockets.get(socketId).data.producer.id;
      const consumer = await client.data.recvTransport.consume({ producerId, ...rtpCapabilities, paused: true });
      client.data.consumers.push(consumer);
      consumer.on('producerclose', () => {
        consumer.close();
      });
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
        id: consumer.id,
        producerId,
        rtpParameters: consumer.rtpParameters,
        kind: consumer.kind,
        appData: consumer.appData,
      };
    })).then(consumersParameters => ({ consumersParameters }));
  }

  @SubscribeMessage('resume_consumer')
  async resumeConsumer(client: Socket, { id }: ResumeConsumerRequest) {
    await client.data.consumers.find(consumer => consumer.id === id).resume();
  }

}
