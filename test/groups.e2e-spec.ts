import { Test, TestingModule } from "@nestjs/testing";
import { ServersModule } from "../src/servers/servers.module";
import { UsersModule } from "../src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import MongooseModules from "../src/MongooseModules";

describe("GroupsController (e2e)", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
        ServersModule,
        UsersModule,
        MongooseModules
      ],
      controllers: [],
      providers: []
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => module.close());

  describe("create a new group", () => {

    it("should create a new group", async () => {
      const response1 = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "a new server" }
      });
      expect(response1.statusCode).toEqual(201);
      const server = response1.json();
      const response2 = await app.inject({
        method: "POST",
        url: "/servers/"+server.id+"/groups",
        payload: { name: "     a new group    " }
      });
      const body = response2.json();
      expect(response2.statusCode).toEqual(201);
      expect(body).toEqual(expect.objectContaining({
        serverId: server.id,
        name: "a new group",
        channels: []
      }));
    });

    it("should return 404 server not found", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers/fakeid/groups",
        payload: { name: "a new group" }
      });
      const body = response.json();
      expect(response.statusCode).toEqual(404);
      expect(body).toStrictEqual({
        statusCode: 404,
        message: `server with id 'fakeid' not found`
      })
    });

    it("should return 400 group name must not be empty", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers/fakeid/groups",
        payload: { name: "         " }
      });
      const body = response.json();
      expect(response.statusCode).toEqual(400);
      expect(body).toStrictEqual({
        statusCode: 400,
        message: "group name must not be empty"
      });

    });

  });

});
