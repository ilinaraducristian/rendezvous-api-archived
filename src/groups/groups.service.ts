import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import Server from "../entities/server";
import { Model } from "mongoose";
import Group, { GroupDocument } from "../entities/group";
import GroupDTO from "../dtos/group";
import UpdateGroupRequest from "../dtos/update-group-request";
import { SocketIoService } from "../socket-io/socket-io.service";
import { NotAMemberException } from "../exceptions/BadRequestExceptions";
import { GroupNotFoundException } from "../exceptions/NotFoundExceptions";
import { MembersService } from "../members/members.service";

@Injectable()
export class GroupsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    private readonly membersService: MembersService,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createGroup(userId: string, serverId: string, name: string): Promise<GroupDTO> {
    const isMember = await this.membersService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const server = await this.serverModel.findById(serverId);

    let lastGroupOrder = 0;
    server.groups.forEach(group => {
      if (group.order > lastGroupOrder) lastGroupOrder = group.order;
    });

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
    return newGroupDto;
  }

  async updateGroup(userId: string, serverId: string, id: string, groupUpdate: UpdateGroupRequest) {
    const isMember = await this.membersService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const server = await this.serverModel.findById(serverId);
    const group = server.groups.find(group => group._id === id);
    let isGroupModified = false;

    if (groupUpdate.name !== undefined) {
      if (group === undefined)
        throw new GroupNotFoundException();
      group.name = groupUpdate.name;
      isGroupModified = true;
    }

    let groups;

    if (groupUpdate.order !== undefined && groupUpdate.order !== 0) {
      // groups = await insertAndSort(this.groupModel, serverId, groupUpdate.order);
      isGroupModified = true;
      const sortedGroups = server.groups.sort((g1, g2) => g1.order - g2.order);
      const index = sortedGroups.findIndex(group => group._id === id);
      sortedGroups[index] = undefined;
      sortedGroups[groupUpdate.order] = group;
      server.groups = sortedGroups.filter(group => group !== undefined).map((group, i) => ({ ...group, order: i }));
    }

    if (isGroupModified) {
      await server.save();
    }

    return { name: groupUpdate.name, groups };
  }

  async deleteGroup(userId: string, serverId: string, id: string) {
    const isMember = await this.membersService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const server = await this.serverModel.findById(serverId);
    const groupIndex = server.groups.findIndex(group => group._id === id);
    server.groups.splice(groupIndex, 1);
    server.groups = server.groups.sort((g1, g2) => g1.order - g2.order).map((group, i) => ({
      ...group,
      order: i
    }));
    await server.save();

    const groups = server.groups.map(group => ({
      id: group._id.toString(),
      order: group.order
    }));

    this.socketIoService.groupDelete(serverId, id, groups);
    return groups;

  }

}
