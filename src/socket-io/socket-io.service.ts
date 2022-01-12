import { Injectable } from "@nestjs/common";
import Member from "../dtos/member";
import SocketIoServerEvents from "../dtos/SocketIoServerEvents";
import { Server as SocketIoServer } from "socket.io";
import Server from "../dtos/server";
import Channel from "../dtos/channel";
import { WebSocketServer } from "@nestjs/websockets";
import Group from "../dtos/group";
import { ChannelIds, ChannelMessageIds, GroupIds, MemberIds } from "src/dtos/common-ids";
import ChannelMessage from "src/entities/channel-message";
import Reaction from "src/dtos/reaction";

@Injectable()
export class SocketIoService {
  socketIoServer: SocketIoServer;

  async joinServer(userId: string, serverId: string) {
    const client = await Array.from(this.socketIoServer.sockets.sockets).find(([_, socket]) => socket.handshake.auth.userId === userId)[1];
    await client.join(serverId);
  }

  async leaveServer(userId: string, serverId: string) {
    const client = await Array.from(this.socketIoServer.sockets.sockets).find(([_, socket]) => socket.handshake.auth.userId === userId)[1];
    await client.leave(serverId);
  }

  newMember(member: Member) {
    this.emit(member.serverId, SocketIoServerEvents.newMember, member);
  }

  serverUpdate(serverId: string, payload: Partial<Server>) {
    this.emit(serverId, SocketIoServerEvents.serverUpdate, payload);
  }

  serverDeleted(serverId: string) {
    this.emit(serverId, SocketIoServerEvents.serverDeleted, serverId);
  }

  newGroup(serverId: string, group: Group) {
    this.emit(serverId, SocketIoServerEvents.newGroup, serverId, group);
  }

  newChannel(ids: GroupIds, channel: Channel) {
    this.emit(ids.serverId, SocketIoServerEvents.newChannel, ids, channel);
  }

  newChannelMessage(ids: ChannelIds, message: ChannelMessage) {
    this.emit(ids.serverId, SocketIoServerEvents.newChannelMessage, ids, message);
  }

  newChannelMessageReaction(ids: ChannelMessageIds, message: Reaction) {
    this.emit(ids.serverId, SocketIoServerEvents.newChannelMessageReaction, ids, message);
  }

  channelUpdate(serverId: string, payload: Partial<Channel> & Pick<Channel, "id">) {
    this.emit(serverId, SocketIoServerEvents.channelUpdate, payload);
  }

  channelDeleted(serverId: string, channelId: string, channels: Pick<Channel, "id" | "order">[]) {
    this.emit(serverId, SocketIoServerEvents.channelDeleted, { channelId, channels });
  }

  groupUpdated(serverId: string, payload: Partial<Group> & Pick<Group, "id">) {
    this.emit(serverId, SocketIoServerEvents.groupUpdate, payload);
  }

  memberLeft(ids: MemberIds) {
    this.emit(ids.serverId, SocketIoServerEvents.memberLeft, ids);
  }

  groupDelete(serverId: string, groupId: string, groups: Pick<Group, "id" | "order">[]) {
    this.emit(serverId, SocketIoServerEvents.groupDeleted, { groupId, groups });
  }

  private emit(id: string, event: SocketIoServerEvents, ...payloads: any[]) {
    this.socketIoServer.to(id).emit(event, ...payloads);
  }
}
