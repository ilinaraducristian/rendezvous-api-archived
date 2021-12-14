import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Server } from "../entities/server";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import GroupDTO from "../dtos/group";
import GroupNameNotEmptyException from "../exceptions/GroupNameNotEmpty.exception";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import { ServersService } from "../servers/servers.service";
import NotAMemberException from "../exceptions/NotAMember.exception";
import UpdateGroupRequest from "../dtos/update-group-request";

@Injectable()
export class GroupsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly serversService: ServersService
  ) {
  }

  async createGroup(userId: string, serverId: string, name: string): Promise<GroupDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw new GroupNameNotEmptyException();

    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const groups = await this.groupModel.find({ serverId }).sort({ order: -1 }).limit(1);

    const newGroup = new this.groupModel({
      name: trimmedName,
      serverId,
      order: (groups[0]?.order ?? -1) + 1
    });

    await this.serverModel.findByIdAndUpdate(serverId, { $push: { groups: newGroup.id } });

    await newGroup.save();
    return Group.toDTO(newGroup);
  }

  async updateGroup(userId: string, serverId: string, id: string, groupUpdate: UpdateGroupRequest) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    let trimmedName;

    if (groupUpdate.name !== undefined) {
      trimmedName = groupUpdate.name.trim();
      if (trimmedName.length === 0) throw new GroupNameNotEmptyException();
      try {
        const newGroup = await this.groupModel.findOneAndUpdate({
          _id: id,
          serverId
        }, { name: trimmedName }, { new: true });
        trimmedName = newGroup.name;
      } catch (e) {
        throw new GroupNotFoundException();
      }
    }

    let groups;

    if (groupUpdate.order !== undefined) {
      groups = await this.groupModel.find({ serverId }).sort({ order: 1 });
      let index = groups.findIndex(group => group.id.toString() === id);
      const group = groups[index];
      groups[index] = undefined;
      groups.splice(groupUpdate.order, 0, group);
      index = groups.findIndex(group => group === undefined);
      groups.splice(index, 1);
      groups = await this.groupModel.bulkSave(groups.map((group, i) => {
        group.order = i;
        return group;
      }));
      groups = groups.map(group => ({ id: group.id.toString(), order: group.order }));
    }

    return { name: trimmedName, groups };
  }

  async deleteGroup(userId: string, serverId: string, id: string): Promise<void> {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    try {
      const group = await this.groupModel.findOneAndDelete({ _id: id });
      if (group === null) throw new Error();
    } catch (e) {
      throw new GroupNotFoundException();
    }

    const groups = await this.groupModel.find({ serverId }).sort({ order: 1 });
    await this.groupModel.bulkSave(groups.map((group, i) => {
      group.order = i;
      return group;
    }));

    const server = await this.serverModel.findByIdAndUpdate(serverId, { $pullAll: { groups: [id] } });

  }


}
