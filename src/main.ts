import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';
import fetch from 'node-fetch';

bootstrap();

async function bootstrap() {

  const { ip } = await fetch('https://api.ipify.org?format=json').then(response => response.json());
  global.webRtcTransportOptions = {
    listenIps: [{ ip: '192.168.1.4' }],
    enableTcp: true,
    enableUdp: true,
    preferUdp: true,
  };

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  app.useWebSocketAdapter(new SocketIoAdapter(app, true));

  await app.listen(process.env.PORT || 3100, '0.0.0.0');
}
