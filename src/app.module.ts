import { DynamicModule, Module, Provider } from '@nestjs/common';
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
import { UserService } from './services/user/user.service';
import { ServerService } from './services/server/server.service';
import { DatabaseService } from './services/database/database.service';
import { MessageService } from './services/message/message.service';
import { ChannelService } from './services/channel/channel.service';
import { GroupService } from './services/group/group.service';
import { ObjectStoreService } from './services/object-store/object-store.service';
import { AppController } from './app.controller';
import { UserGateway } from './gateways/user.gateway';
import { GroupGateway } from './gateways/group.gateway';
import { ServerEntity } from './entities/server.entity';
import { FriendshipEntity } from './entities/friendship.entity';
import { FriendshipService } from './services/friendship/friendship.service';
import { MemberEntity } from './entities/member.entity';
import { RtpCodecCapability } from 'mediasoup/src/RtpParameters';
import { GroupEntity } from './entities/group.entity';

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
    UserService,
    ServerService,
    DatabaseService,
    MessageService,
    ChannelService,
    GroupService,
    ObjectStoreService,
    FriendshipService,
  ];
  static gateways = [
    ServerGateway,
    ChannelGateway,
    GroupGateway,
    MessageGateway,
    MediasoupGateway,
    UserGateway,
  ];

  static asyncImports(): DynamicModule[] {
    const { parsed }: any = config();
    if (parsed === undefined)
      AppModule.envVariables = process.env;
    else
      AppModule.envVariables = Object.assign(parsed, process.env);
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
    const entities = [ServerEntity, GroupEntity, ChannelEntity, MessageEntity, FriendshipEntity, MemberEntity];
    return [
      TypeOrmModule.forRoot(
        {
          ...commonOptions,
          entities,
          database: AppModule.envVariables.DB_NAME,
        }),
      TypeOrmModule.forRoot(
        {
          ...commonOptions,
          name: 'keycloakConnection',
          entities: [UserEntity],
          database: AppModule.envVariables.KEYCLOAK_DB_NAME,
        }),
      TypeOrmModule.forFeature(entities),
      TypeOrmModule.forFeature([UserEntity], 'keycloakConnection'),
    ];
  }

  static mediasoupProvider(): Provider {
    return {
      provide: Router,
      // @ts-ignore
      useFactory: () => createWorker({ rtcMinPort: 64535, rtcMaxPort: 65535 })
        .then(worker => worker.createRouter({ mediaCodecs })),
    };
  }

}

const mediaCodecs: RtpCodecCapability[] = [
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