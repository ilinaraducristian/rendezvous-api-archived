import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { ChannelType } from "../dtos/channel";
import { ServersService } from "../servers/servers.service";
import { ChannelMessagesModule } from "./channel-messages.module";
import { ChannelMessagesService } from "./channel-messages.service";

describe("ChannelMessagesService", () => {
  let messagesService: ChannelMessagesService,
    serversService: ServersService;
  let module: TestingModule;

  jest.setTimeout(30000);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        ChannelMessagesModule
      ]
    }).compile();

    messagesService = module.get<ChannelMessagesService>(ChannelMessagesService);
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
    await Promise.all(new Array(100).fill(0).map((_, i) => messagesService.createMessage(userId, serverId, groupId, channelId, `message_${i}`)));
  });

  afterEach(async () => {
    await serversService.deleteServer(userId, serverId);
  });

  it("should return the channel messages", async () => {
    const messages = await messagesService.getMessages(userId, serverId, groupId, channelId, 0);
    expect(messages.length).toBeGreaterThan(0);
  });

});
