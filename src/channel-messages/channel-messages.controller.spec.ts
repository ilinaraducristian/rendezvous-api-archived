import { Test, TestingModule } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { ChannelMessagesController } from "./channel-messages.controller";

describe("MessagesController", () => {
  let app: NestFastifyApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [ChannelMessagesController],
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

  describe("create message", () => {

    it("should return 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/",
        payload: { text: "a new message" }
      });
      expect(response.statusCode).toEqual(201);
    });

    it("should return 400 for a bad message", async () => {
      let badTexts: any = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "   "];
      for (const text of badTexts) {
        const response = await app.inject({
          method: "POST",
          url: "/",
          payload: { text }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

  });

  describe("message update", () => {

    it("should return 200", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/0",
        payload: { text: "a new message" }
      });
      expect(response.statusCode).toStrictEqual(200);
    });

    it("should return 400 for a bad text", async () => {
      let badTexts: any = [-1, 2, -Infinity, Infinity, -NaN, NaN, 3.14, "", "   "];
      for (const text of badTexts) {
        const response = await app.inject({
          method: "PUT",
          url: "/0",
          payload: { text }
        });
        expect(response.statusCode).toStrictEqual(400);
      }
    });

  });

  describe("delete message", () => {

    it("should return 200", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/0"
      });
      expect(response.statusCode).toStrictEqual(200);
    });

  });

});
