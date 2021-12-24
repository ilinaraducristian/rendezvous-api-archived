import { Injectable } from "@nestjs/common";
import ServerDTO from "../dtos/server";
import { Server, ServerDocument } from "../entities/server";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";
import { Member } from "../entities/member";
import NotAMemberException from "../exceptions/NotAMember.exception";
import { v4 as uuid } from "uuid";
import BadOrExpiredInvitationException from "../exceptions/BadOrExpiredInvitation.exception";
import AlreadyMemberException from "../exceptions/AlreadyMember.exception";
import UpdateServerRequest from "../dtos/update-server-request";
import { insertAndSort } from "../util";
import { SocketIoService } from "../socket-io/socket-io.service";
import ChannelType from "../dtos/channel-type";

@Injectable()
export class ServersService {

  constructor(
    @InjectModel(Server.name) private readonly serverModel: Model<Server>,
    @InjectModel(Member.name) private readonly memberModel: Model<Member>,
    private readonly socketIoService: SocketIoService
  ) {
  }

  async createServer(userId: string, name: string): Promise<ServerDTO> {
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

  async isMember(userId: string, serverId: string) {
    try {
      return await this.memberModel.exists({ userId, serverId });
    } catch (e) {
      return false;
    }
  }

  async createInvitation(userId: string, id: string) {
    const isMember = await this.isMember(userId, id);
    if (isMember === false) throw new NotAMemberException();
    const server = await this.serverModel.findById(id);
    // TODO don't generate a new invitation if the previous one is not expired
    server.invitation = uuid();
    server.invitation_exp = new Date();
    server.invitation_exp.setDate(server.invitation_exp.getDate() + 7);
    await server.save();
    return {
      invitation: server.invitation,
      invitation_exp: server.invitation_exp.toISOString()
    };
  }

  async createMember(userId: string, invitation: string) {
    let server;
    try {
      server = await this.serverModel.findOne({ invitation }).populate("members");
      if (server === null) throw new Error();
      if (new Date() > server.date) throw new Error();
    } catch (e) {
      throw new BadOrExpiredInvitationException();
    }
    const isMember = await this.isMember(userId, server.id);
    if (isMember === true) throw new AlreadyMemberException();
    const servers = await this.memberModel.find({ userId }).sort({ order: -1 }).limit(1);
    const newOrder = (servers[0]?.order ?? -1) + 1;

    const newMember = new this.memberModel({
      userId,
      serverId: server.id,
      order: newOrder
    });
    await newMember.save();
    server.members.push(newMember.id);
    await server.save();
    this.socketIoService.newMember(server.id, Member.toDTO(newMember));
    server = await this.serverModel.findById(server.id).populate(["channels", {
      path: "groups",
      populate: "channels"
    }, "members"]);
    const newServer = Server.toDTO(server);
    newServer.order = newOrder;
    newServer.members = server.members.map(member => Member.toDTO(member));
    return newServer;
  }

  async deleteMember(userId: string, memberId: string) {
    let member: Member;
    try {
      member = await this.memberModel.findOneAndDelete({ _id: memberId, userId });
      if (member === undefined || member === null) throw new Error();
    } catch (e) {
      throw new NotAMemberException();
    }
    this.socketIoService.memberLeft(member.serverId, memberId);
    await this.fixServersOrder([userId]);
  }

  async getServers(userId: string) {
    const members = await this.memberModel.find({ userId }).populate({
      path: "serverId", populate: [{
        path: "groups",
        populate: "channels"
      }, "members"]
    });
    return members.map(({ serverId, order }) => {
      const serverDocument = serverId as unknown as ServerDocument & { id: string };
      const server = Server.toDTO(serverDocument);
      server.order = order;
      server.members = serverDocument.members.map(member => Member.toDTO(member));
      return server;
    });
  }

  async updateServer(userId: string, id: string, serverUpdate: UpdateServerRequest) {

    const isMember = await this.isMember(userId, id);
    if (isMember === false) throw new NotAMemberException();

    if (serverUpdate.name !== undefined) {
      try {
        const newServer = await this.serverModel.findOneAndUpdate({ _id: id }, { name: serverUpdate.name }, { new: true });
        if (newServer === null) throw new Error();
      } catch (e) {
        throw new ServerNotFoundException();
      }
    }

    if (serverUpdate.order === undefined) return { name: serverUpdate.name };

    const userServers = await insertAndSort(this.memberModel, userId, serverUpdate.order);

    return { name: serverUpdate.name, servers: userServers };
  }

  async deleteServer(userId: string, id: string): Promise<void> {
    const isMember = await this.isMember(userId, id);
    if (isMember === false) throw new NotAMemberException();

    const members = await this.memberModel.find({ serverId: id }, "userId");
    const membersUserIds = members.map(member => member.userId);

    try {
      await Promise.all([
        this.serverModel.findOneAndRemove({ _id: id }),
        this.memberModel.deleteMany({ serverId: id })
      ]);
      await this.fixServersOrder(membersUserIds);
    } catch (e) {
      throw e;
    }

    this.socketIoService.serverDeleted(id);

  }

  private async fixServersOrder(membersUserIds: string[]) {
    await Promise.all(
      membersUserIds.map(memberUserId =>
        this.memberModel.find({ userId: memberUserId }).sort({ order: 1 })
          .then(servers =>
            this.memberModel.bulkSave(servers.map((server, i) => {
              server.order = i;
              return server;
            }))
          )
      )
    );
  }

}
