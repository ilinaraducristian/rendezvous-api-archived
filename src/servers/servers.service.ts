import { Injectable } from "@nestjs/common";
import ServerDTO from "../dtos/server";
import { Server } from "../entities/server";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Channel } from "../entities/channel";
import { Group } from "../entities/group";
import ServerNameNotEmptyException from "../exceptions/ServerNameNotEmpty.exception";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";

@Injectable()
export class ServersService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>
  ) {
  }

  async createServer(name: string): Promise<ServerDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw ServerNameNotEmptyException;
    let newServer = new this.serverModel({ name: trimmedName });
    await newServer.save();
    return Server.toDTO(newServer);
  }

  async getServer(id: string) {
    try {
      const server = await this.serverModel.findById(id);
      if (server === null) throw Error();
      return server;
    } catch (e) {
      throw ServerNotFoundException;
    }
  }

  async getFullServer(id: string) {
    try {
      const server = await this.serverModel.findById(id).populate([{
        path: "groups",
        populate: "channels"
      }, "channels"]);
      if (server === null) throw Error();
      return Server.toDTO(server);
    } catch (e) {
      throw ServerNotFoundException;
    }
  }

  async updateServerName(id: string, name: string): Promise<ServerDTO> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) throw ServerNameNotEmptyException;

    try {
      const newServer = await this.serverModel.findOneAndUpdate({ _id: id }, { name: trimmedName }, { new: true });
      return Server.toDTO(newServer);
    } catch (e) {
      throw ServerNotFoundException;
    }
  }

  async deleteServer(id: string): Promise<void> {
    try {
      const server = await this.serverModel.findOneAndDelete({ _id: id });
      if (server === null) throw Error();
    } catch (e) {
      throw ServerNotFoundException;
    }
  }

}
