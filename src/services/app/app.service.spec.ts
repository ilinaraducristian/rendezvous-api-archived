import { AppService } from 'src/services/app/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';
import { ServerGateway } from 'src/gateways/server.gateway';
import { ChannelGateway } from 'src/gateways/channel.gateway';
import { MessageGateway } from 'src/gateways/message.gateway';
import { MediasoupGateway } from 'src/gateways/mediasoup.gateway';

describe('AppService', () => {
  let service: AppService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...AppModule.asyncImports(),
      ],
      controllers: [],
      providers: [
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        AppModule.mediasoupProvider(),
        AppService,
        ServerGateway,
        ChannelGateway,
        MessageGateway,
        MediasoupGateway,
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterAll(() => {
    module.close();
  });

  it('should work', async () => {
  });
});