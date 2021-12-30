import { Test, TestingModule } from "@nestjs/testing";
import { MessagesService } from "./messages.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagesModule } from "./messages.module";
import { ServersService } from "../servers/servers.service";
import ChannelType from "../dtos/channel-type";

describe("MessagesService", () => {
  let messagesService: MessagesService,
    serversService: ServersService;
  let module: TestingModule;

  jest.setTimeout(30000);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MessagesModule,
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous")
      ]
    }).compile();

    messagesService = module.get<MessagesService>(MessagesService);
    serversService = module.get<ServersService>(ServersService);
  });

  afterAll(() => module.close());

  let userId = "61aa0b90c85c37292276eb39",
    serverId, groupId, channelId;

  beforeEach(async () => {
    const server = await serversService.createServer(userId, "a new server");
    serverId = server.id;
    groupId = server.groups.find(group => group.channels.find(channel => channel.type === ChannelType.text) !== undefined).id;
    channelId = server.groups.find(group => group.id === groupId).channels[0].id;
    for (let i = 0; i < 100; i++) {
      // await new Promise(r => setTimeout(r, 100));
      await messagesService.createMessage(userId, serverId, groupId, channelId, `message_${i}`);
    }
  });

  afterEach(async () => {
    await serversService.deleteServer(userId, serverId);
  });

  it("should return the messages", async () => {
    const messages = await messagesService.getMessages(userId, serverId, groupId, channelId, 130);
    expect(messages.length).toBeGreaterThan(0);
  });

});
