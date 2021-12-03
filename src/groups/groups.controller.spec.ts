import { Test, TestingModule } from "@nestjs/testing";
import { GroupsController } from "./groups.controller";

describe('GroupsController', () => {
  let groupsController: GroupsController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [GroupsController],
    }).compile();

    groupsController = module.get<GroupsController>(GroupsController);
  });

  afterAll(() => module.close());
  
  describe("basic CRUD requests for groups", () => {

    it("should create a new group", () => {
      expect(groupsController.createGroup(0, { name: "group name" })).toBeInstanceOf(Object);
    });

    it("should throw server not found", () => {
      expect(groupsController.createGroup(-1, { name: "group name" })).toThrowError("server with id '-1' not found");
    });

    it("should return the new groups order", () => {
      expect(groupsController.moveGroup(0, 0, { index: 3 })).toBeInstanceOf(Array);
    });

    it("should throw server not found", () => {
      expect(groupsController.moveGroup(-1, 0, { index: 3 })).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(groupsController.moveGroup(0, -1, { index: 3 })).toThrowError("group with id '-1' not found");
    });

    it("should return nothing", () => {
      expect(groupsController.deleteGroup(0, 0)).toBeUndefined();
    });

    it("should throw server not found", () => {
      expect(groupsController.deleteGroup(-1, 0)).toThrowError("server with id '-1' not found");
    });

    it("should throw group not found", () => {
      expect(groupsController.deleteGroup(0, -1)).toThrowError("group with id '-1' not found");
    });

  });

});
