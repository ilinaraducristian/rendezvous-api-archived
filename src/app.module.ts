import { Module, Provider } from '@nestjs/common';
import { ServersController } from './controllers/servers/servers.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ServerEntity } from './entities/server.entity';
import { SocketIOGateway } from './socketio.gateway';
import { ChannelsController } from './controllers/channels/channels.controller';
import { UsersController } from './controllers/users/users.controller';
import { InvitationsController } from './controllers/invitations/invitations.controller';
import { createWorker } from 'mediasoup';
import { Router } from 'mediasoup/lib/Router';

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters:
      {
        'x-google-start-bitrate': 1000,
      },
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters:
      {
        'profile-id': 2,
        'x-google-start-bitrate': 1000,
      },
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
      {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
      {
        'packetization-mode': 1,
        'profile-level-id': '42e01f',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
  },
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: process.env.DB_TYPE as 'mysql' | 'mariadb',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities:
          process.env.ENVIRONMENT === 'production'
            ? ['./**/*.entity{.ts,.js}']
            : ['dist/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([ServerEntity]),
    KeycloakConnectModule.registerAsync({
      useFactory: () => ({
        authServerUrl: process.env.AUTH_SERVER_URL,
        realm: process.env.REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        secret: process.env.KEYCLOAK_CLIENT_SECRET,
        // optional if you want to retrieve JWT from cookie
        cookieKey: 'KEYCLOAK_JWT',
        // optional loglevels. default is verbose
        logLevels: ['warn'],
      }),
    }),
  ],
  controllers: [
    ServersController,
    ChannelsController,
    UsersController,
    InvitationsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppModule.mediasoupProvider(),
    AppService,
    SocketIOGateway,
  ],
})
export class AppModule {

  static mediasoupProvider(): Provider {
    return {
      provide: Router,
      // @ts-ignore
      useFactory: () => createWorker().then(worker => worker.createRouter({ mediaCodecs })),
    };
  }

}
