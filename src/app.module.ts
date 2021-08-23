import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AppService } from 'src/services/app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { createWorker } from 'mediasoup';
import { Router } from 'mediasoup/lib/Router';
import { UserEntity } from './entities/user.entity';
import { config } from 'dotenv';
import { ServerGateway } from './gateways/server.gateway';
import { MediasoupGateway } from './gateways/mediasoup.gateway';
import { ChannelGateway } from './gateways/channel.gateway';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';
import { MessageGateway } from './gateways/message.gateway';
import { AppController } from 'src/app.controller';
import { UserService } from './services/user/user.service';
import { ServerService } from './services/server/server.service';
import { DatabaseService } from './services/database/database.service';
import { MessageService } from './services/message/message.service';
import { ChannelService } from './services/channel/channel.service';
import { GroupService } from './services/group/group.service';
import { ObjectStoreService } from './services/object-store/object-store.service';

@Module({
  imports: [
    ...AppModule.asyncImports(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppModule.mediasoupProvider(),
    ...AppModule.services,
    ...AppModule.gateways,
  ],
})
export class AppModule {

  static envVariables: { [key: string]: string };
  static services = [
    AppService,
    UserService,
    ServerService,
    DatabaseService,
    MessageService,
    ChannelService,
    GroupService,
    ObjectStoreService,
  ];
  static gateways = [
    ServerGateway,
    ChannelGateway,
    MessageGateway,
    MediasoupGateway,
  ];

  static asyncImports(): DynamicModule[] {
    const { parsed }: any = config();
    if (parsed === undefined)
      AppModule.envVariables = process.env;
    else
      AppModule.envVariables = parsed;
    return [
      ...AppModule.typeORM(),
      KeycloakConnectModule.register({
        authServerUrl: AppModule.envVariables.AUTH_SERVER_URL,
        realm: AppModule.envVariables.REALM,
        clientId: AppModule.envVariables.KEYCLOAK_CLIENT_ID,
        secret: AppModule.envVariables.KEYCLOAK_CLIENT_SECRET,
        // optional if you want to retrieve JWT from cookie
        cookieKey: 'KEYCLOAK_JWT',
        // optional loglevels. default is verbose
        logLevels: ['warn'],
      }),
    ];
  }

  static typeORM(): DynamicModule[] {
    const commonOptions = {
      type: AppModule.envVariables.DB_TYPE as 'mysql' | 'mariadb',
      host: AppModule.envVariables.DB_HOST,
      port: parseInt(AppModule.envVariables.DB_PORT),
      username: AppModule.envVariables.DB_USER,
      password: AppModule.envVariables.DB_PASS,
      synchronize: false,
      retryAttempts: 500,
    };
    return [
      TypeOrmModule.forRoot(
        {
          ...commonOptions,
          entities: [ChannelEntity, MessageEntity],
          database: AppModule.envVariables.DB_NAME,
        }),
      TypeOrmModule.forRoot(
        {
          ...commonOptions,
          name: 'keycloakConnection',
          entities: [UserEntity],
          database: AppModule.envVariables.KEYCLOAK_DB_NAME,
        }),
      TypeOrmModule.forFeature([ChannelEntity, MessageEntity]),
      TypeOrmModule.forFeature([UserEntity], 'keycloakConnection'),
    ];
  }

  static mediasoupProvider(): Provider {
    return {
      provide: Router,
      // @ts-ignore
      useFactory: () => createWorker().then(worker => worker.createRouter({ mediaCodecs })),
    };
  }

}

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