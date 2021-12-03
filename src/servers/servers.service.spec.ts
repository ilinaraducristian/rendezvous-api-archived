import { Test, TestingModule } from "@nestjs/testing";
import { ServersService } from "./servers.service";
import databaseMocker from "./database-mocker";
import { MongooseModule } from "@nestjs/mongoose";
import { Server, ServerSchema } from "../entities/server";
import { Channel, ChannelSchema } from "../entities/channel";
import { Group, GroupSchema } from "../entities/group";
import { Member, MemberSchema } from "../entities/member";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";
import ServerNameNotEmptyException from "../exceptions/ServerNameNotEmpty.exception";


describe("ServersService", () => {
  let serversService: ServersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@localhost:27017/rendezvous"),
        MongooseModule.forFeature([
          { name: Server.name, schema: ServerSchema }, {
            name: Channel.name,
            schema: ChannelSchema
          },
          {
            name: Group.name,
            schema: GroupSchema
          },
          {
            name: Member.name,
            schema: MemberSchema
          }
        ])
      ],
      providers: [ServersService]
    }).useMocker(databaseMocker)
      .compile();

    serversService = module.get<ServersService>(ServersService);
  });

  afterAll(() => module.close());

  describe("create a new server", () => {

    it("should return a new server", async () => {
      const result = await serversService.createServer("a new server");
      expect(result).toBeInstanceOf(Object);
    });

    it("should return a new server with the right name", async () => {
      await expect(serversService.createServer("a new server")).resolves.toEqual(expect.objectContaining({ name: "a new server" }));
    });

    it("should throw server name must not be empty", async () => {
      await expect(serversService.createServer("   ")).rejects.toThrowError(ServerNameNotEmptyException);
    });

  });

  describe("modify the server name", () => {

    let server;

    beforeAll(async () => {
      server = await serversService.createServer("a new server");
    });

    it("should return the server with the new name", async () => {
      const result = await serversService.updateServerName(server.id, "    another server    ");
      expect(result).toStrictEqual({ ...server, name: "another server" });
    });

    it("should throw server name must not be empty", async () => {
      await expect(serversService.updateServerName(server.id, "        ")).rejects.toThrowError(ServerNameNotEmptyException);
    });

    it("should throw server not found", async () => {
      await expect(serversService.updateServerName("fakeid", "another server")).rejects.toThrowError(ServerNotFoundException);
    });

  });

  describe("delete a server", () => {

    it("should return nothing", async () => {
      const newServer = await serversService.createServer("a new server");
      await expect(serversService.deleteServer(newServer.id)).resolves.toBeUndefined();
    });

    it("should throw server not found", async () => {
      await expect(serversService.deleteServer("61a85ac8115dbc842ce9aa6d")).rejects.toThrowError(ServerNotFoundException);
    });

    it("should throw server not found", async () => {
      await expect(serversService.deleteServer("fake id")).rejects.toThrowError(ServerNotFoundException);
    });

  });

});
