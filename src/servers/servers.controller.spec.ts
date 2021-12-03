import { Test, TestingModule } from "@nestjs/testing";
import { ServersController } from "./servers.controller";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { ServersService } from "./servers.service";
import idGenerator from "../id-generator";

const moduleMocker = new ModuleMocker(global);
const serverIdGenerator = idGenerator();

describe('ServersController', () => {
  let serversController: ServersController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ServersController],
    })
      .useMocker(mocker => {
        if(mocker === ServersService) {
          return {
            createServer(name: string) {
              const trimmedName = name.trim();
              if(trimmedName.length === 0) throw new Error('server name must not be empty');
              return {
                id: serverIdGenerator.next().value + '',
                name: trimmedName,
                order: 0,
                channels: [],
                groups: [],
                members: []
              }
            },
            updateServerName() {

            },
            deleteServer() {

            }
          }
        }
        if (typeof mocker === 'function') {
          const mockMetadata = moduleMocker.getMetadata(mocker) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    serversController = module.get<ServersController>(ServersController);
  });

  afterAll(() => module.close());

  describe('create a new server', () => {

    it('should return a new server', async() => {
      await expect(serversController.createNewServer({ name: "   server name       " })).resolves.toEqual(expect.objectContaining({name: "server name"}));
    })

    it('should throw server name must not be empty', async() => {
      await expect(serversController.createNewServer({ name: "          " })).rejects.toThrowError('server name must not be empty')
    })

    it('should throw server name must not be empty', async() => {
      await expect(serversController.createNewServer({ name: undefined })).rejects.toThrowError('server name must not be empty')
    })

  });

  describe("basic CRUD requests for servers", () => {

    it("should return a new server", async () => {
      await expect(serversController.createNewServer({ name: "   server name       " })).resolves.toEqual(expect.objectContaining({name: "server name"}));
    });

    it("should return an existing server", () => {
      expect(serversController.getServer(0)).toBeInstanceOf("object");
    });

    it("should throw server not found", () => {
      expect(serversController.getServer(-1)).toThrowError("server with id '-1' not found");
    });

    it("should return an empty object", () => {
      expect(serversController.modifyServer({ name: "server name" })).toBe({});
    });

    it("should return an object with the invalid arguments", () => {
      const response = serversController.modifyServer({ fakeKey: "server name", fakeKey2: 123, name: 123, id: 3 });
      const expectedResponse = {
        fakeKey: "this key doesn't exist for this type",
        fakeKey2: "this key doesn't exist for this type",
        name: "this field must be a string",
        id: "this field is not modifiable"
      };
      expect(response).toBe(expectedResponse);
    });

    it("should return nothing", () => {
      const response = serversController.deleteServer(0);
      expect(response).toBeUndefined();
    });

    it("should throw server not found", () => {
      expect(serversController.deleteServer(-1)).toThrowError("server with id '-1' not found");
    });

  });

});
