import { Test, TestingModule } from "@nestjs/testing";
import { v4 as uuid } from "uuid";
import MongooseModules from "../MongooseModules";
import { MongooseModule } from "@nestjs/mongoose";
import { TestService } from "./test.service";

describe("Test", () => {
  let testService: TestService;
  let module: TestingModule;

  jest.setTimeout(30000);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModules,
        MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous")
      ],
      controllers: [],
      providers: [TestService]
    }).compile();

    testService = module.get<TestService>(TestService);
  });

  afterAll(() => module.close());

  describe("create server", () => {

    it("should return a new server", async () => {
      const server = await testService.createServer(uuid(), "a new server");
      expect(server).toBeUndefined();
    });

  });
});
