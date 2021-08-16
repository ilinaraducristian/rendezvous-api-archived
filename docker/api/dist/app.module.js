'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppModule_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppModule = void 0;
const common_1 = require('@nestjs/common');
const app_service_1 = require('./app.service');
const typeorm_1 = require('@nestjs/typeorm');
const nest_keycloak_connect_1 = require('nest-keycloak-connect');
const core_1 = require('@nestjs/core');
const mediasoup_1 = require('mediasoup');
const Router_1 = require('mediasoup/lib/Router');
const user_entity_1 = require('./entities/user.entity');
const dotenv_1 = require('dotenv');
const server_gateway_1 = require('./gateways/server.gateway');
const mediasoup_gateway_1 = require('./gateways/mediasoup.gateway');
const channel_gateway_1 = require('./gateways/channel.gateway');
const channel_entity_1 = require('./entities/channel.entity');
const message_entity_1 = require('./entities/message.entity');
const message_gateway_1 = require('./gateways/message.gateway');
let AppModule = AppModule_1 = class AppModule {
  static asyncImports() {
    const { parsed } = dotenv_1.config();
    AppModule_1.envVariables = parsed;
    return [
      ...AppModule_1.typeORM(),
      nest_keycloak_connect_1.KeycloakConnectModule.register({
        authServerUrl: AppModule_1.envVariables.AUTH_SERVER_URL,
        realm: AppModule_1.envVariables.REALM,
        clientId: AppModule_1.envVariables.KEYCLOAK_CLIENT_ID,
        secret: AppModule_1.envVariables.KEYCLOAK_CLIENT_SECRET,
        cookieKey: 'KEYCLOAK_JWT',
        logLevels: ['warn'],
      }),
    ];
  }

  static typeORM() {
    const commonOptions = {
      type: AppModule_1.envVariables.DB_TYPE,
      host: AppModule_1.envVariables.DB_HOST,
      port: parseInt(AppModule_1.envVariables.DB_PORT),
      username: AppModule_1.envVariables.DB_USER,
      password: AppModule_1.envVariables.DB_PASS,
      synchronize: false,
      retryAttempts: 500,
    };
    return [
      typeorm_1.TypeOrmModule.forRoot({
        ...commonOptions,
        entities: [channel_entity_1.ChannelEntity, message_entity_1.MessageEntity],
        database: AppModule_1.envVariables.DB_NAME,
      }),
      typeorm_1.TypeOrmModule.forRoot({
        ...commonOptions,
        name: 'keycloakConnection',
        entities: [user_entity_1.UserEntity],
        database: AppModule_1.envVariables.KEYCLOAK_DB_NAME,
      }),
      typeorm_1.TypeOrmModule.forFeature([channel_entity_1.ChannelEntity, message_entity_1.MessageEntity]),
      typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity], 'keycloakConnection'),
    ];
  }

  static mediasoupProvider() {
    return {
      provide: Router_1.Router,
      useFactory: () => mediasoup_1.createWorker().then(worker => worker.createRouter({ mediaCodecs })),
    };
  }
};
AppModule = AppModule_1 = __decorate([
  common_1.Module({
    imports: [
      ...AppModule_1.asyncImports(),
    ],
    controllers: [],
    providers: [
      {
        provide: core_1.APP_GUARD,
        useClass: nest_keycloak_connect_1.AuthGuard,
      },
      AppModule_1.mediasoupProvider(),
      app_service_1.AppService,
      server_gateway_1.ServerGateway,
      channel_gateway_1.ChannelGateway,
      message_gateway_1.MessageGateway,
      mediasoup_gateway_1.MediasoupGateway,
    ],
  }),
], AppModule);
exports.AppModule = AppModule;
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
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters: {
      'profile-id': 2,
      'x-google-start-bitrate': 1000,
    },
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters: {
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
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000,
    },
  },
];
//# sourceMappingURL=app.module.js.map