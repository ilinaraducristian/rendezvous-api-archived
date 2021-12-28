import { Injectable } from "@nestjs/common";
import Member from "../dtos/member";
import SocketIoEvents from "../dtos/SocketIoEvents";
import { Server as SocketIoServer } from "socket.io";
import Server from "../dtos/server";
import Channel from "../dtos/channel";
import { WebSocketServer } from "@nestjs/websockets";
import Group from "../dtos/group";

@Injectable()
export class SocketIoService {

  @WebSocketServer()
  socketIoServer: SocketIoServer;

  private socketsUsers: Map<string, string> = new Map();

  addSocketUserPair(pair: { socketId: string, userId: string }) {
    this.socketsUsers.set(pair.socketId, pair.userId);
    this.socketsUsers.set(pair.userId, pair.socketId);
  }

  removeSocketUserPair(pair: { socketId: string, userId: string }) {
    this.socketsUsers.delete(pair.socketId);
    this.socketsUsers.delete(pair.userId);
  }

  getSocketUserPairBySocketIdOrUserId(socketIdOrUserId: string) {
    return this.socketsUsers.get(socketIdOrUserId);
  }

  async joinServer(userId: string, serverId: string) {
    const pair = this.getSocketUserPairBySocketIdOrUserId(userId);
    if (pair === undefined) return;
    await this.socketIoServer.sockets.sockets.get(pair).join(serverId);
  }

  async leaveServer(userId: string, serverId: string) {
    const pair = this.getSocketUserPairBySocketIdOrUserId(userId);
    if (pair === undefined) return;
    await this.socketIoServer.sockets.sockets.get(pair).leave(serverId);
  }

  newMember(serverId: string, member: Member) {
    this.emit(serverId, SocketIoEvents.newMember, member);
  }

  memberLeft(serverId: string, memberId: string) {
    this.emit(serverId, SocketIoEvents.memberLeft, memberId);
  }

  serverUpdate(serverId: string, payload: Partial<Server>) {
    this.emit(serverId, SocketIoEvents.serverUpdate, payload);
  }

  serverDeleted(serverId: string) {
    this.emit(serverId, SocketIoEvents.serverDeleted);
  }

  newChannel(serverId: string, channel: Channel) {
    this.emit(serverId, SocketIoEvents.newChannel, channel);
  }

  channelUpdate(serverId: string, payload: Partial<Channel> & Pick<Channel, 'id'>) {
    this.emit(serverId, SocketIoEvents.channelUpdate, payload);
  }

  channelDelete(serverId: string, channelId: string, channels: Pick<Channel, "id" | "order">[]) {
    this.emit(serverId, SocketIoEvents.channelDeleted, { channelId, channels });
  }

  newGroup(serverId: string, group: Group) {
    this.emit(serverId, SocketIoEvents.newGroup, group);
  }

  groupUpdate(serverId: string, payload: Partial<Group> & Pick<Group, 'id'>) {
    this.emit(serverId, SocketIoEvents.groupUpdate, payload);
  }

  groupDelete(serverId: string, groupId: string, groups: Pick<Group, 'id' | 'order'>[]) {
    this.emit(serverId, SocketIoEvents.groupDeleted, { groupId, groups });
  }

  private emit(id: string, event: SocketIoEvents, payload?: any) {
    this.socketIoServer.to(id).emit(event, payload);
  }

}
