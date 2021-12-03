import { Test, TestingModule } from "@nestjs/testing";
import { ChannelsService } from "./channels.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagesModule } from "../messages/messages.module";
import MongooseModules from "../MongooseModules";
import { ChannelsController } from "./channels.controller";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";

describe('ChannelsService', () => {
  let channelsService: ChannelsService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        MessagesModule,
        MongooseModules
      ],
      controllers: [ChannelsController],
      providers: [ServersService, GroupsService, ChannelsService]
    }).compile();

    channelsService = module.get<ChannelsService>(ChannelsService);
  });

  afterAll(() => module.close())

  it('should be defined', () => {
    expect(channelsService).toBeDefined();
  });
});
