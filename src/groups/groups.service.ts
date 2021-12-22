import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Server } from "../entities/server";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import GroupDTO from "../dtos/group";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import { ServersService } from "../servers/servers.service";
import NotAMemberException from "../exceptions/NotAMember.exception";
import UpdateGroupRequest from "../dtos/update-group-request";
import { insertAndSort } from "../util";

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
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    const lastGroup = (await this.groupModel.find({ serverId }).sort({ order: -1 }).limit(1))[0];

    const newGroup = new this.groupModel({
      name,
      serverId,
      order: (lastGroup?.order ?? -1) + 1
    });

    await this.serverModel.findByIdAndUpdate(serverId, { $push: { groups: newGroup.id } });

    await newGroup.save();
    return Group.toDTO(newGroup);
  }

  async updateGroup(userId: string, serverId: string, id: string, groupUpdate: UpdateGroupRequest) {
    const isMember = await this.serversService.isMember(userId, serverId);
    if (isMember === false) throw new NotAMemberException();

    if (groupUpdate.name !== undefined) {
      try {
        const newGroup = await this.groupModel.findOneAndUpdate({
          _id: id,
          serverId
        }, { name: groupUpdate.name }, { new: true });
        if (newGroup === undefined || newGroup === null) throw new Error();
      } catch (e) {
        throw new GroupNotFoundException();
      }
    }

    if (groupUpdate.order === undefined) return { name: groupUpdate.name };

    const groups = await insertAndSort(this.groupModel, serverId, groupUpdate.order);
    return { name: groupUpdate.name, groups };
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

    await this.serverModel.findByIdAndUpdate(serverId, { $pullAll: { groups: [id] } });

  }


}
