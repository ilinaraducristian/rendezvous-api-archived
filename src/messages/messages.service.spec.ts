import { Test, TestingModule } from "@nestjs/testing";
import { MessagesService } from "./messages.service";
import MongooseModules from "../MongooseModules";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagesController } from "./messages.controller";
import { ServersService } from "../servers/servers.service";
import { GroupsService } from "../groups/groups.service";
import { ChannelsService } from "../channels/channels.service";

describe('MessagesService', () => {
  let messagesService: MessagesService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModules,
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
      ],
      controllers: [MessagesController],
      providers: [ServersService, GroupsService, ChannelsService, MessagesService]
    }).compile();

    messagesService = module.get<MessagesService>(MessagesService);
  });

  afterAll(() => module.close())


  it('should create a new message', async () => {
    for(let i = 2 ; i < 22 ; i++)
    await messagesService.createMessage('61aa0b90c85c37292276eb39', null, '61aa0b90c85c37292276eb40', 'a new message ' + i);
    expect(true).toBeTruthy();
  })

  it('should return the messages in reverse order', async () => {
    // create message in 61aa0b90c85c37292276eb40
    const res = await messagesService.getMessages('61aa0b90c85c37292276eb39', null, '61aa0b90c85c37292276eb40')
    expect(messagesService).toBeDefined();
  });
});
