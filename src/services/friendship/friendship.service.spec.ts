import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipService } from './message.service';

describe('MessageService', () => {
  let service: FriendshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendshipService],
    }).compile();

    service = module.get<FriendshipService>(FriendshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
