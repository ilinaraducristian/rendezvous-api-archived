import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AppModule } from '../../app.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;
  const user1 = '97a8ffc2-10cd-47dd-b915-cf8243d5bfc4';

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

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', async () => {
    const data = await service.getUserData(user1);
    console.log(JSON.stringify(data));
    expect(service).toBeDefined();
  });
});
