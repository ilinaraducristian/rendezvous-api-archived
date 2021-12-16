import { Test, TestingModule } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { GroupsController } from "./groups.controller";

describe("GroupsController", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [GroupsController],
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

  describe("create group", () => {

    it("should return 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/",
        payload: { name: "a new group" }
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

  describe("group update", () => {

    it("should return 200", async () => {
      const payloads = [
        { name: "a new group name" },
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

  describe("delete group", () => {

    it("should return 200", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/0"
      });
      expect(response.statusCode).toStrictEqual(200);
    });

  });

});
