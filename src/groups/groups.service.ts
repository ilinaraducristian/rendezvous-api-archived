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

@Injectable()
export class GroupsService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly serversService: ServersService
  ) {
  }

  async createGroup(serverId: string, name: string): Promise<GroupDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw GroupNameNotEmptyException;
    const server = await this.serversService.getServer(serverId);
    const newGroup = new this.groupModel({
      name: trimmedName,
      serverId
    });
    await newGroup.save();
    server.groups.push(newGroup.id);
    await server.save();
    return Group.toDTO(newGroup);
  }

  async getGroup(id: string) {
    try {
      const group = await this.groupModel.findById(id);
      if (group === null) throw Error();
      return group;
    } catch (e) {
      throw GroupNotFoundException;
    }
  }

  async updateGroupName(id: string, name: string): Promise<GroupDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw GroupNameNotEmptyException;

    try {
      const newGroup = await this.groupModel.findOneAndUpdate({ _id: id }, { name: trimmedName }, { new: true });
      return Group.toDTO(newGroup);
    } catch (e) {
      throw GroupNotFoundException;
    }
  }

  async deleteGroup(serverId: string, id: string): Promise<void> {
    const server = await this.serversService.getServer(serverId);
    try {
      const group = await this.groupModel.findOneAndDelete({ _id: id });
      if (group === null) throw new Error();
    } catch (e) {
      throw GroupNotFoundException;
    }
    const index = server.groups.findIndex(group => group._id === id);
    server.groups.splice(index, 1);
    await server.save();
  }


}
