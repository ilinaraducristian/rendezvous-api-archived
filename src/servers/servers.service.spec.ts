import { Test, TestingModule } from "@nestjs/testing";
import { v4 as uuid } from "uuid";
import { ServersService } from "./servers.service";

describe("ServersService", () => {
  let serversService: ServersService;
  let module: TestingModule;

  jest.setTimeout(30000);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [ServersService],
    }).compile();

    serversService = module.get<ServersService>(ServersService);
  });

  afterAll(() => module.close());

  describe("create server", () => {
    it("should return a new server", async () => {
      const server = await serversService.createServer(uuid(), "a new server");
      expect(server).toBeDefined();
    });
  });

  describe("server update", () => {
    it("should return the updated server", async () => {
      const updates = [
        { name: "a new server name" },
        { order: 1 },
        { name: "another server name", order: 3 },
      ];
      const uid1 = uuid();
      const server = await serversService.createServer(uid1, "a new server");
      for (const update of updates) {
        const updatedServer = await serversService.updateServer(
          uid1,
          server.id,
          update
        );
        expect(updatedServer).toBeDefined();
      }
    });
  });

  describe("delete server", () => {
    it("should delete the server", async () => {
      const uid1 = uuid();
      const server = await serversService.createServer(uid1, "a new server");
      const updatedServer = await serversService.deleteServer(uid1, server.id);
      expect(updatedServer).toBeDefined();
    });
  });
});
