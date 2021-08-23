import { Test, TestingModule } from '@nestjs/testing';
import { ObjectStoreService } from './object-store.service';

describe('ObjectStoreService', () => {
  let service: ObjectStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectStoreService],
    }).compile();

    service = module.get<ObjectStoreService>(ObjectStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
