import { Test, TestingModule } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import ChannelType from "../dtos/channel-type";

describe("ChannelsController", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [ChannelsController],
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

  describe("create channel", () => {

    it("should return 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/",
        payload: { name: "a new channel", type: 0 }
      });
      expect(response.statusCode).toEqual(201);
    });

    it("should return 400 for a bad type", async () => {
      const badTypes = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "-1", "2", "Infinity", "a new channel"];
      for (const type of badTypes) {
        const response = await app.inject({
          method: "POST",
          url: "/",
          payload: { name: "a new channel", type }
        });
        expect(response.statusCode).toStrictEqual(400);
        expect(response.json()).toStrictEqual({
          "error": "Bad Request",
          "message": [
            "type must be a valid enum value"
          ],
          "statusCode": 400
        });
      }
    });

    it("should return 400 for a bad name", async () => {
      let badNames: any = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "   "];
      for (const name of badNames) {
        const response = await app.inject({
          method: "POST",
          url: "/",
          payload: { name, type: ChannelType.text }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

  });

  describe("channel update", () => {

    it("should return 200", async () => {
      const payloads = [
        { name: "a new channel name" },
        { order: 1, groupId: "61b9e4a537e8556178e72207" },
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
          payload: { groupId: "", order }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

    it("should return 400 for a bad groupId", async () => {
      let badGroupIds: any = [-1, -Infinity, Infinity, -NaN, NaN, 3.14, "-1", "2", " string "];
      for (const groupId of badGroupIds) {
        const response = await app.inject({
          method: "PUT",
          url: "/0",
          payload: { groupId, order: 0 }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

    // if one is missing, the other one should be ignored
    it("should return 200 for missing groupId or order", async () => {
      let payloads: any = [
        { groupId: 0 },
        { order: null }
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

  });

  describe("delete channel", () => {

    it("should return 200", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/0"
      });
      expect(response.statusCode).toStrictEqual(200);
    });

  });

});
