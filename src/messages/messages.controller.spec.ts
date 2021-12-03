import { Test, TestingModule } from "@nestjs/testing";
import { MessagesController } from "./messages.controller";

describe("MessagesController", () => {
  let messagesController: MessagesController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [MessagesController]
    }).compile();

    messagesController = module.get<MessagesController>(MessagesController);
  });

  afterAll(() => module.close());

  describe("creating a new message", () => {

    it("should create a new message", () => {
      expect(messagesController.createMessage(0, null, 0, { text: "message content" })).toBeInstanceOf(Object);
    });

    it("should throw server not found", () => {
      expect(messagesController.createMessage(-1, null, 0, { text: "message content" })).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(messagesController.createMessage(0, -1, 0, { text: "message content" })).toThrowError("group with id '-1' not found");
    });

    it("should throw channel not found", () => {
      expect(messagesController.createMessage(0, null, -1, { text: "message content" })).toThrowError("channel with id '-1' not found");
    });

    it("should throw channel is not for texting", () => {
      expect(messagesController.createMessage(0, null, 1, { text: "message content" })).toThrowError("channel with id '1' is not for texting");
    });

  });

  describe("editing a message", () => {

    it("should create a new message", () => {
      expect(messagesController.editMessage(0, null, 0, 0, { text: "message content" })).toBeUndefined();
    });

    it("should throw server not found", () => {
      expect(messagesController.editMessage(-1, null, 0, 0, { text: "message content" })).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(messagesController.editMessage(0, -1, 0, 0, { text: "message content" })).toThrowError("group with id '-1' not found");
    });

    it("should throw channel not found", () => {
      expect(messagesController.editMessage(0, null, -1, 0, { text: "message content" })).toThrowError("channel with id '-1' not found");
    });

    it("should throw channel is not for texting", () => {
      expect(messagesController.editMessage(0, null, 1, 0, { text: "message content" })).toThrowError("channel with id '1' is not for texting");
    });

    it("should throw message not found", () => {
      expect(messagesController.editMessage(0, null, 1, -1, { text: "message content" })).toThrowError("message with id '-1' not found");
    });

  });

  describe("deleting a message", () => {

    it("should return nothing", () => {
      expect(messagesController.deleteMessage(0, null, 0, 0)).toBeUndefined();
    });

    it("should throw server not found", () => {
      expect(messagesController.deleteMessage(-1, null, 0, 0)).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(messagesController.deleteMessage(0, -1, 0, 0)).toThrowError("group with id '-1' not found");
    });

    it("should throw channel not found", () => {
      expect(messagesController.deleteMessage(0, null, -1, 0)).toThrowError("channel with id '-1' not found");
    });

    it("should throw channel is not for texting", () => {
      expect(messagesController.deleteMessage(0, null, 1, 0)).toThrowError("channel with id '1' is not for texting");
    });

    it("should throw message not found", () => {
      expect(messagesController.deleteMessage(0, null, 1, -1)).toThrowError("message with id '-1' not found");
    });

  });
  
});
