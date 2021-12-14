import { Test, TestingModule } from "@nestjs/testing";
import { ServersService } from "./servers.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ServersModule } from "./servers.module";
import MongooseModules from "../MongooseModules";
import { routes } from "../app.module";
import ServerNameNotEmptyException from "../exceptions/ServerNameNotEmpty.exception";
import AlreadyMemberException from "../exceptions/AlreadyMember.exception";
import BadOrExpiredInvitationException from "../exceptions/BadOrExpiredInvitation.exception";
import NotAMemberException from "../exceptions/NotAMember.exception";
import { performance } from "perf_hooks";

const uid1 = "d368a4be-b04a-44dd-a945-41f88c1e46f6";
const uid2 = "d368a4be-b04a-44dd-a945-41f88c1e46f7";
const uid3 = "d368a4be-b04a-44dd-a945-41f88c1e46f8";
const uid4 = "d368a4be-b04a-44dd-a945-41f88c1e46f9";
const uid5 = "d368a4be-b04a-44dd-a945-41f88c1e47a0";
const uid6 = "d368a4be-b04a-44dd-a945-41f88c1e47a1";
const serverName = "a new server";

describe("ServersService", () => {
  let serversService: ServersService;
  let module: TestingModule;

  jest.setTimeout(30000);

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

    serversService = module.get<ServersService>(ServersService);
  });

  afterAll(() => module.close());

  describe("create a new server", () => {

    it("should return a new server", async () => {
      await expect(serversService.createServer(uid1, `   ${serverName}   `)).resolves.toEqual(expect.objectContaining({ name: serverName }));
    });

    it("should throw server name must not be empty", async () => {
      await expect(serversService.createServer(uid1, "   ")).rejects.toThrowError(ServerNameNotEmptyException);
    });

  });

  describe("existing server", () => {

    let serverId;

    beforeEach(async () => {
      const server = await serversService.createServer(uid1, serverName);
      serverId = server.id;
    });

    describe("create a new invitation", () => {

      it("should return a new invitation", async () => {
        const result = await serversService.createInvitation(uid1, serverId);
        expect(typeof result.invitation).toEqual("string");
        expect(typeof result.invitation_expiration_date).toEqual("string");
      });

      it("should return a new invitation again", async () => {
        const result = await serversService.createInvitation(uid1, serverId);
        expect(typeof result.invitation).toEqual("string");
        expect(typeof result.invitation_expiration_date).toEqual("string");
      });

      it("should throw not a member", async () => {
        await expect(serversService.createInvitation(uid2, serverId)).rejects.toThrowError(NotAMemberException);
      });

    });

    describe("join a server", () => {

      let invitation;

      beforeAll(async () => {
        const result = await serversService.createInvitation(uid1, serverId);
        invitation = result.invitation;
      });

      it("should return existing server with the new member", async () => {
        await expect(serversService.createMember(uid2, invitation)).resolves.toEqual(expect.objectContaining({
          members: expect.arrayContaining([expect.objectContaining({
            userId: uid2
          })])
        }));
      });

      it("should throw already member", async () => {
        await expect(serversService.createMember(uid1, invitation)).rejects.toThrowError(AlreadyMemberException);
      });

      it("should throw bad or expired invitation", async () => {
        await expect(serversService.createMember(uid1, "fake invitation")).rejects.toThrowError(BadOrExpiredInvitationException);
      });

    });

    describe("leave a server", () => {

      it("should leave the server", async () => {
        await expect(serversService.deleteMember(uid1, serverId)).resolves.toBeUndefined();
      });

      it("should throw not a member", async () => {
        await expect(serversService.deleteMember(uid2, serverId)).rejects.toThrowError(NotAMemberException);
      });

    });

    describe("change the server name", () => {

      const serverName2 = "another server";

      it("should return the server with the new name", async () => {
        await expect(serversService.changeServerName(uid1, serverId, `   ${serverName2}   `)).resolves.toEqual(expect.objectContaining({ name: serverName2 }));
      });

      it("should throw server name must not be empty", async () => {
        await expect(serversService.changeServerName(uid1, serverId, "   ")).rejects.toThrowError(ServerNameNotEmptyException);
      });

      it("should throw not a member", async () => {
        await expect(serversService.changeServerName(uid2, serverId, serverName2)).rejects.toThrowError(NotAMemberException);
      });

      it("should throw not a member again", async () => {
        await expect(serversService.changeServerName(uid1, "fakeid", serverName2)).rejects.toThrowError(NotAMemberException);
      });

    });

    describe("delete a server", () => {

      it("remove server check order", async () => {
        const { invitation } = await serversService.createInvitation(uid1, serverId);
        await Promise.all([
          serversService.createMember(uid2, invitation),
          serversService.createMember(uid3, invitation),
          serversService.createMember(uid4, invitation),
          serversService.createMember(uid5, invitation),
          serversService.createMember(uid6, invitation)
        ]);
        await serversService.deleteServer(uid1, serverId);
        expect(true).toBeTruthy();
      });

      it("should return nothing", async () => {
        await expect(serversService.deleteServer(uid1, serverId)).resolves.toBeUndefined();
      });

      it("should throw not a member", async () => {
        await expect(serversService.deleteServer(uid2, serverId)).rejects.toThrowError(NotAMemberException);
      });

      it("should throw not a member again", async () => {
        await expect(serversService.deleteServer(uid1, "fakeid")).rejects.toThrowError(NotAMemberException);
      });

    });

  });

  it("join multiple servers, leave one in the middle, check mew order", async () => {
    const startTime = performance.now();
    let serverId;
    await serversService.createServer(uid1, "server 1").then(() =>
      serversService.createServer(uid1, "server 2")).then(() =>
      serversService.createServer(uid1, "server 3")).then(() =>
      serversService.createServer(uid1, "server 4").then(server => {
        serverId = server.id;
      })
    ).then(() =>
      serversService.createServer(uid1, "server 5")).then(() =>
      serversService.createServer(uid1, "server 6")).then(() =>
      serversService.createServer(uid1, "server 7"));
    const time1 = performance.now();
    console.log(time1 - startTime);
    await serversService.deleteServer(uid1, serverId);
    const time2 = performance.now();
    console.log(time2 - startTime);
    const newServers = await serversService.getServers(uid1);
    const time3 = performance.now();
    console.log(time3 - startTime);
    expect(true).toBeTruthy();
  });

});
