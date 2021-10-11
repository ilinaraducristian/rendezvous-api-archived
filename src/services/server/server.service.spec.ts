import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './server.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';
import { AppModule } from '../../app.module';

describe('ServerService', () => {
  let service: ServerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...AppModule.asyncImports(),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        AppModule.mediasoupProvider(),
        ...AppModule.services,
        ...AppModule.gateways,
      ],
    }).compile();

    service = module.get<ServerService>(ServerService);
  });

  afterAll(() => module.close());

  it('should create a new server', async () => {
    console.log(await service.createServer('97a8ffc2-10cd-47dd-b915-cf8243d5bfc4', 'new server'));
    expect(true);
  });
});
