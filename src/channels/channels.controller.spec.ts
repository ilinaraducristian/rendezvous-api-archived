import { Test, TestingModule } from "@nestjs/testing";
import { ChannelsController } from "./channels.controller";

describe('ChannelsController', () => {
  let channelsController: ChannelsController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ChannelsController],
    }).compile();

    channelsController = module.get<ChannelsController>(ChannelsController);
  });

  afterAll(() => module.close());

  describe("basic CRUD requests for channels", () => {

    it("should create a new channel", () => {
      expect(channelsController.createChannel(0, null, { name: "channel name" })).toBeInstanceOf(Object);
    });

    it("should throw server not found", () => {
      expect(channelsController.createGroup(-1, null, { name: "channel name" })).toThrowError("server with id '-1' not found");
    });

    it("should return the new channels order", () => {
      expect(channelsController.moveChannel(0, null, 0, { index: 3 })).toBeInstanceOf(Array);
    });

    it("should throw server not found", () => {
      expect(channelsController.moveChannel(-1, null, 0, { index: 3 })).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(channelsController.moveChannel(0, -1, 0, { index: 3 })).toThrowError("group with id '-1' not found");
    });

    it("should throw channel not found", () => {
      expect(channelsController.moveChannel(0, null, -1, { index: 3 })).toThrowError("group with id '-1' not found");
    });

    it("should return nothing", () => {
      expect(channelsController.deleteChannel(0, null, 0)).toBeUndefined();
    });

    it("should throw server not found", () => {
      expect(channelsController.deleteChannel(-1, null, 0)).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(channelsController.deleteChannel(0, -1, 0)).toThrowError("group with id '-1' not found");
    });

    it("should throw channel not found", () => {
      expect(channelsController.deleteChannel(0, null, -1)).toThrowError("channel with id '-1' not found");
    });

  });
  
});
