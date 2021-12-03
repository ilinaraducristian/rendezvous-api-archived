import { Test, TestingModule } from "@nestjs/testing";
import { ServersModule } from "../src/servers/servers.module";
import { UsersModule } from "../src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import MongooseModules from "../src/MongooseModules";

describe("ServersController (e2e)", () => {
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

  describe("create a new server", () => {

    it("should create a new server", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "    a new server    " }
      });
      expect(response.statusCode).toEqual(201);
      const body = response.json();
      expect(body).toEqual(expect.objectContaining({
        name: "a new server",
        order: -1,
        channels: [],
        groups: [],
        members: []
      }));
    });

    it("should return 400 server name must not be empty", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "       " }
      });
      expect(response.statusCode).toEqual(400);
      const body = response.json();
      expect(body).toStrictEqual({
        statusCode: 400,
        message: "server name must not be empty"
      });
    });

  });

  describe("change server name", () => {

    it("should change a server name", async () => {
      const response1 = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "    a new server    " }
      });
      expect(response1.statusCode).toEqual(201);
      const server = response1.json();
      const response2 = await app.inject({
        method: "PUT",
        url: "/servers/" + server.id,
        payload: { name: "    another server    " }
      });
      expect(response2.statusCode).toEqual(204);
    });

    it("should return 400 server name must not be empty", async () => {
      const response1 = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "    a new server    " }
      });
      expect(response1.statusCode).toEqual(201);
      const server = response1.json();
      const response2 = await app.inject({
        method: "PUT",
        url: "/servers/" + server.id,
        payload: { name: "        " }
      });
      expect(response2.statusCode).toEqual(400);
      const body = response2.json();
      expect(body).toStrictEqual({
        statusCode: 400,
        message: "server name must not be empty"
      });
    });

    it("should return 404 server not found", async () => {
      const id = "fakeid";
      const response = await app.inject({
        method: "PUT",
        url: "/servers/" + id,
        payload: { name: "server name" }
      });
      expect(response.statusCode).toEqual(404);
      const body = response.json();
      expect(body).toStrictEqual({
        statusCode: 404,
        message: `server with id '${id}' not found`
      });
    });

  });

  describe("delete a server", () => {

    it("should delete a server", async () => {
      const response1 = await app.inject({
        method: "POST",
        url: "/servers",
        payload: { name: "    a new server    " }
      });
      expect(response1.statusCode).toEqual(201);
      const server = response1.json();
      const response2 = await app.inject({
        method: "DELETE",
        url: "/servers/" + server.id
      });
      expect(response2.statusCode).toEqual(200);
      expect(true).toBeTruthy();
    });

  });

});
