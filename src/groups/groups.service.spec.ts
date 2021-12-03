import { Test, TestingModule } from "@nestjs/testing";
import { GroupsService } from "./groups.service";
import GroupNameNotEmptyException from "../exceptions/GroupNameNotEmpty.exception";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";
import { getModelToken } from "@nestjs/mongoose";
import { Group } from "../entities/group";

describe('GroupsService', () => {
  let groupsService: GroupsService;
  let module: TestingModule;

  beforeAll(async () => {
    const mockGroup = {

    }
    module = await Test.createTestingModule({
      providers: [GroupsService,
        {
          provide: getModelToken(Group.name),
          useValue: mockGroup,
        }
      ],
    }).compile();

    groupsService = module.get<GroupsService>(GroupsService);
  });

  afterAll(() => module.close());

  describe("create a new group", () => {

    it('should return a new group', async() => {
      const groupName = "        a new group      ";
      const group  = await groupsService.createGroup('61a85ac8115dbc842ce9aa6d', groupName);
      expect(group).toEqual(expect.objectContaining({
        serverId: '61a85ac8115dbc842ce9aa6d',
        name: groupName.trim(),
        channels: []
      }))
    })

    it('should throw group name must not be empty', async() => {
      const groupName = "              ";
      await expect(groupsService.createGroup('61a85ac8115dbc842ce9aa6d', groupName)).rejects.toThrowError(GroupNameNotEmptyException);
    })

    it('should throw server not found', async() => {
      const groupName = "group name";
      await expect(groupsService.createGroup('61a85ac8115dbc842ce9aa6f', groupName)).rejects.toThrowError(ServerNotFoundException);
    })

  });

});
