import { Test, TestingModule } from "@nestjs/testing";
import { ChannelsService } from "./channels.service";
import { MongooseModule } from "@nestjs/mongoose";
import MongooseModules from "../MongooseModules";
import { ServersService } from "../servers/servers.service";
import { ServersModule } from "../servers/servers.module";
import { routes } from "../app.module";
import ChannelType from "../dtos/channel-type";
import ChannelNameNotEmptyException from "../exceptions/ChannelNameNotEmpty.exception";
import NotAMemberException from "../exceptions/NotAMember.exception";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";

const uid1 = "d368a4be-b04a-44dd-a945-41f88c1e46f6";
const uid2 = "d368a4be-b04a-44dd-a945-41f88c1e46f7";

describe("ChannelsService", () => {
  let channelsService: ChannelsService;
  let serversService: ServersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ServersModule,
        MongooseModules,
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        routes
      ],
      controllers: [],
      providers: []
    }).compile();


    channelsService = module.get<ChannelsService>(ChannelsService);
    serversService = module.get<ServersService>(ServersService);
  });

  afterAll(() => module.close());

  let serverId, groupId;

  beforeEach(async () => {
    const server = await serversService.createServer(uid1, "a new server");
    serverId = server.id;
    groupId = server.groups[0].id;
  });

  describe("create a new channel", () => {

    const channelName = "a new channel";

    it("should return the new channel for a server", async () => {
      await expect(channelsService.createChannel(uid1, serverId, null, `   ${channelName}   `, ChannelType.text))
        .resolves.toEqual(expect.objectContaining({
          serverId,
          groupId: "",
          name: channelName,
          type: ChannelType.text
        }));
    });

    it("should return the new channel for a group", async () => {
      await expect(channelsService.createChannel(uid1, serverId, groupId, `   ${channelName}   `, ChannelType.text))
        .resolves.toEqual(expect.objectContaining({ serverId, groupId, name: channelName, type: ChannelType.text }));
    });

    it("should throw name not empty", async () => {
      await expect(channelsService.createChannel(uid1, serverId, groupId, `   `, ChannelType.text))
        .rejects.toThrowError(ChannelNameNotEmptyException);
    });

    it("should throw not a member", async () => {
      await expect(channelsService.createChannel(uid2, serverId, groupId, `   `, ChannelType.text))
        .rejects.toThrowError(NotAMemberException);
    });

    it("should throw not a member", async () => {
      await expect(channelsService.createChannel(uid1, "fakeid", groupId, `   `, ChannelType.text))
        .rejects.toThrowError(NotAMemberException);
    });

    it("should throw not a member", async () => {
      await expect(channelsService.createChannel(uid1, serverId, "fakeid", `   `, ChannelType.text))
        .rejects.toThrowError(GroupNotFoundException);
    });

  });

  describe("delete a channel", () => {

    it("should remove the channel", async () => {
    });

  });

  afterEach(async () => {
    await serversService.deleteServer(uid1, serverId);
  });

});
