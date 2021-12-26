import { Injectable } from "@nestjs/common";
import Group, { GroupDocument } from "../entities/group";
import UpdateGroupRequest from "../dtos/update-group-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { DefaultGroupCannotBeDeletedException } from "../exceptions/BadRequestExceptions";
import { GroupNotFoundException } from "../exceptions/NotFoundExceptions";
import { MembersService } from "../members/members.service";
import { ServersService } from "../servers/servers.service";

@Injectable()
export class GroupsService {

  constructor(
    private readonly serversService: ServersService,
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createGroup(userId: string, serverId: string, name: string) {

    const server = await this.serversService.getById(userId, serverId);
    const lastGroupOrder = server.groups.reduce((g1, g2) => g1.order > g2.order ? g1 : g2).order;

    const newGroup = {
      name,
      serverId,
      order: lastGroupOrder + 1,
      channels: []
    };
    const index = server.groups.push(newGroup);
    await server.save();

    const newGroupDto = Group.toDTO(server.groups[index] as GroupDocument, serverId);
    this.socketIoService.newGroup(serverId, newGroupDto);
  }

  async updateGroup(userId: string, serverId: string, groupId: string, groupUpdate: UpdateGroupRequest) {
    const server = await this.serversService.getById(userId, serverId);
    const group = server.groups.find(group => group._id === groupId);

    if (group === undefined) throw new GroupNotFoundException();

    let isGroupModified = false;

    if (groupUpdate.name !== undefined) {
      isGroupModified = true;
      group.name = groupUpdate.name;
    }

    let groups;

    if (groupUpdate.order !== undefined) {
      isGroupModified = true;
      const sortedGroups = server.groups.sort((g1, g2) => g1.order - g2.order);
      const index = sortedGroups.findIndex(group => group._id === groupId);
      sortedGroups[index] = undefined;
      sortedGroups.splice(groupUpdate.order, 0, group);
      server.groups = sortedGroups.filter(group => group !== undefined).map((group, i) => ({ ...group, order: i }));
    }

    if (isGroupModified) {
      await server.save();
    }

    return { name: groupUpdate.name, groups };
  }

  async deleteGroup(userId: string, serverId: string, groupId: string) {

    const server = await this.serversService.getById(userId, serverId);
    const index = server.groups.findIndex(group => group._id === groupId);

    if (index === -1) throw new GroupNotFoundException();

    if (server.groups[index].order === 0) throw new DefaultGroupCannotBeDeletedException();

    server.groups.splice(index, 1);
    server.groups = server.groups.sort((g1, g2) => g1.order - g2.order).map((group, i) => ({
      ...group,
      order: i
    }));

    await server.save();

    const groups = server.groups.map(group => ({
      id: group._id.toString(),
      order: group.order
    }));

    this.socketIoService.groupDelete(serverId, groupId, groups);

  }

}
