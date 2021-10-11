import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { AppModule } from '../../app.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';

describe('GroupService', () => {
  let service: GroupService;
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

    service = module.get<GroupService>(GroupService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should rearrange groups', async () => {

  });
});
