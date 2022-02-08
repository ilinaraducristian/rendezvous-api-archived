import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import Group from "../entities/group";
import { GroupsService } from "./groups.service";

describe("GroupsService", () => {
  let groupsService: GroupsService;
  let module: TestingModule;

  beforeAll(async () => {
    const mockGroup = {};
    module = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group.name),
          useValue: mockGroup,
        },
      ],
    }).compile();

    groupsService = module.get<GroupsService>(GroupsService);
  });

  afterAll(() => module.close());

  describe("create a new group", () => {
    // it('should return a new group', async() => {
    //   const groupName = "        a new group      ";
    //   const group  = await groupsService.createGroup('61a85ac8115dbc842ce9aa6d', groupName);
    //   expect(group).toEqual(expect.objectContaining({
    //     serverId: '61a85ac8115dbc842ce9aa6d',
    //     name: groupName.trim(),
    //     channels: []
    //   }))
    // })
    //
    // it('should throw group name must not be empty', async() => {
    //   const groupName = "              ";
    //   await expect(groupsService.createGroup('61a85ac8115dbc842ce9aa6d', groupName)).rejects.toThrowError(GroupNameNotEmptyException);
    // })
    //
    // it('should throw server not found', async() => {
    //   const groupName = "group name";
    //   await expect(groupsService.createGroup('61a85ac8115dbc842ce9aa6f', groupName)).rejects.toThrowError(ServerNotFoundException);
    // })
  });
});
