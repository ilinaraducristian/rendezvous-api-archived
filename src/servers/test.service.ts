import { Injectable } from "@nestjs/common";
import { Server } from "../entities/server";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Member } from "../entities/member";
import ChannelType from "../dtos/channel-type";

@Injectable()
export class TestService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Member.name) private readonly memberModel: Model<Member>
  ) {
  }

  async createServer(userId: string, name: string) {
    let newServer = new this.serverModel({ name });
    const servers = await this.memberModel.find({ userId }).sort({ order: -1 }).limit(1);
    let newOrder = 0;
    if (servers.length > 0) newOrder = servers[0].order + 1;

    const defaultGroup = {
      name: "default",
      order: 0,
      channels: []
    };

    const textGroup = {
      name: "Text Channels",
      order: 1,
      channels: [{
        name: "general",
        order: 0,
        type: ChannelType.text
      }]
    };
    const voiceGroup = {
      name: "Voice Channels",
      order: 2,
      channels: [{
        name: "General",
        order: 0,
        type: ChannelType.voice
      }]
    };

    const newMember = new this.memberModel({
      userId,
      serverId: newServer.id,
      order: newOrder
    });

    newServer.groups.push(defaultGroup, textGroup, voiceGroup);
    newServer.members.push(newMember.id);

    await Promise.all([
      newServer.save(),
      newMember.save()
    ]);
    const serverDto = Server.toDTO(newServer);
    serverDto.order = newOrder;
    return serverDto;
  }
}
