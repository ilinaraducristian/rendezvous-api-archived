import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';
import { AppModule } from '../../app.module';

describe('DatabaseService', () => {
  let service: DatabaseService;
  const uid1 = '40ede82c-41a3-44b9-97d7-25dc25bde568';
  // const uid2 = '588ed943-d335-4b2c-89fc-98e1745e8859';
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', async () => {
    const server = await service.create_server(uid1, 'a new server');
    const invitation = await service.create_invitation(uid1, server[0][0].id);
    let p = invitation[0];
    let o = Object.values(p)[0];
    expect(o).toBeTruthy();
    expect(true);
  });
});
