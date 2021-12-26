import { Injectable } from "@nestjs/common";
import Group, { GroupDocument } from "../entities/group";
import UpdateGroupRequest from "../dtos/update-group-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { DefaultGroupCannotBeDeletedException } from "../exceptions/BadRequestExceptions";
import { GroupNotFoundException } from "../exceptions/NotFoundExceptions";
import { ServersService } from "../servers/servers.service";
import { getMaxOrder } from "../util";

@Injectable()
export class GroupsService {

  constructor(
    private readonly serversService: ServersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createGroup(userId: string, serverId: string, name: string) {

    const server = await this.serversService.getById(userId, serverId);
    const lastGroupOrder = getMaxOrder(server.groups);

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

  async getById(userId: string, serverId: string, groupId: string) {
    const server = await this.serversService.getById(userId, serverId);
    const group = server.groups.find(group => group._id === groupId);
    if (group === undefined) throw new GroupNotFoundException();
    group.server = server;
    return group as GroupDocument;
  }

  async updateGroup(userId: string, serverId: string, groupId: string, groupUpdate: UpdateGroupRequest) {

    const group = await this.getById(userId, serverId, groupId);

    let isGroupModified = false;

    if (groupUpdate.name !== undefined) {
      isGroupModified = true;
      group.name = groupUpdate.name;
    }

    let groups;

    if (groupUpdate.order !== undefined) {
      isGroupModified = true;
      const sortedGroups = group.server.groups.sort((g1, g2) => g1.order - g2.order);
      const index = sortedGroups.findIndex(group => group._id === groupId);
      sortedGroups[index] = undefined;
      sortedGroups.splice(groupUpdate.order, 0, group);
      group.server.groups = sortedGroups.filter(group => group !== undefined).map((group, i) => ({
        ...group,
        order: i
      }));
      groups = group.server.groups.map(group => ({
        id: group._id.toString(),
        order: group.order
      }));
    }

    if (isGroupModified) {
      await group.server.save();
    }

    return { name: groupUpdate.name, groups };
  }

  async deleteGroup(userId: string, serverId: string, groupId: string) {

    const group = await this.getById(userId, serverId, groupId);
    const index = group.server.groups.findIndex(group => group._id === groupId);

    if (index === -1) throw new GroupNotFoundException();

    if (group.server.groups[index].order === 0) throw new DefaultGroupCannotBeDeletedException();

    group.server.groups.splice(index, 1);
    group.server.groups = group.server.groups.sort((g1, g2) => g1.order - g2.order).map((group, i) => ({
      ...group,
      order: i
    }));

    await group.server.save();

    const groups = group.server.groups.map(group => ({
      id: group._id.toString(),
      order: group.order
    }));

    this.socketIoService.groupDelete(serverId, groupId, groups);

  }

}
