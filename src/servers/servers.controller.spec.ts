import { ValidationPipe } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { ServersController } from "./servers.controller";

describe("ServersController", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [ServersController],
      providers: []
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => module.close());

  describe("create server", () => {

    it("should return 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/",
        payload: { name: "a new server" }
      });
      expect(response.statusCode).toEqual(201);
    });

    it("should return 400 for a bad name", async () => {
      let badNames: any = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "   "];
      for (const name of badNames) {
        const response = await app.inject({
          method: "POST",
          url: "/",
          payload: { name }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

  });

  describe("server update", () => {

    it("should return 200", async () => {
      const payloads = [
        { name: "a new server name" },
        { order: 1 }
      ];
      for (const payload of payloads) {
        const response = await app.inject({
          method: "PUT",
          url: "/0",
          payload
        });
        expect(response.statusCode).toStrictEqual(200);
      }
    });

    it("should return 400 for a bad name", async () => {
      let badNames: any = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "   "];
      for (const name of badNames) {
        const response = await app.inject({
          method: "PUT",
          url: "/0",
          payload: { name }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

    it("should return 400 for a bad order", async () => {
      let badOrders: any = [-1, -Infinity, Infinity, -NaN, NaN, 3.14, "", "2", "3.14"];
      for (const order of badOrders) {
        const response = await app.inject({
          method: "PUT",
          url: "/0",
          payload: { order }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

  });

  describe("delete server", () => {

    it("should return 200", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/0"
      });
      expect(response.statusCode).toStrictEqual(200);
    });

  });

});
