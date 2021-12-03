import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let userController: UsersController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController]
    }).compile();

    userController = module.get<UsersController>(UsersController);
  });

  afterAll(() => module.close());

  describe("user requests", () => {

    // it("should return user data", () => {
    //   expect(appController.getUserData()).toBeInstanceOf(Object);
    // });

    it("should return the joined server", () => {
      expect(userController.addUserToServer("a25f1a3f-1b62-4b8c-9819-de0b41abd578")).toBeInstanceOf(Object);
    });

    it("should throw server not found", () => {
      expect(userController.addUserToServer("ed8c6d18-d048-47d6-8148-3f1bb853ab6e")).toThrowError("invitation 'ed8c6d18-d048-47d6-8148-3f1bb853ab6e' not found");
    });

  });

});
