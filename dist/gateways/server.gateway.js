"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const app_service_1 = require("../app.service");
const channel_model_1 = require("../models/channel.model");
let ServerGateway = class ServerGateway {
    constructor(appService) {
        this.appService = appService;
    }
    async handleConnection(client, ...args) {
        const response = await this.appService.getUserData(client.handshake.auth.sub);
        client.data = { recvTransports: [], consumers: [] };
        await Promise.all(response.servers.map((server) => client.join(`server_${server.id}`)));
    }
    async getUserData(client) {
        const response = await this.appService.getUserData(client.handshake.auth.sub);
        response.servers.forEach(server => {
            server.channels.forEach(this.processChannel(this.server));
            server.groups.forEach(group => group.channels.forEach(this.processChannel(this.server)));
        });
        return response;
    }
    async createServer(client, payload) {
        const result = await this.appService.createServer(client.handshake.auth.sub, payload.name);
        client.join(`server_${result.servers[0].id}`);
        return result;
    }
    async createInvitation(client, { serverId }) {
        return { invitation: await this.appService.createInvitation(client.handshake.auth.sub, serverId) };
    }
    async joinServer(client, payload) {
        const result = await this.appService.joinServer(client.handshake.auth.sub, payload.invitation);
        const newMember = result.servers.map(server => server.members).flat()
            .find((member) => member.userId === client.handshake.auth.sub);
        const newUser = result.users
            .find((user) => user.id === client.handshake.auth.sub);
        const serverId = result.servers[0].id;
        result.servers[0].channels.forEach(this.processChannel(this.server));
        result.servers[0].groups.forEach(group => group.channels.forEach(this.processChannel(this.server)));
        client.join(`server_${serverId}`);
        client.to(`server_${serverId}`).emit('new_member', {
            member: newMember,
            user: newUser,
        });
        return result;
    }
    async createChannel(client, payload) {
        const channelId = await this.appService.createChannel(client.handshake.auth.sub, payload.serverId, payload.groupId, channel_model_1.ChannelType.Text, payload.channelName);
        const channel = {
            id: channelId,
            serverId: payload.serverId,
            groupId: payload.groupId,
            type: channel_model_1.ChannelType.Text,
            name: payload.channelName,
        };
        client.to(`server_${payload.serverId}`).emit('new_channel', channel);
        return { channelId };
    }
    async createGroup(client, payload) {
        const groupId = await this.appService.createGroup(client.handshake.auth.sub, payload.serverId, payload.groupName);
        const group = {
            id: groupId,
            serverId: payload.serverId,
            name: payload.groupName,
        };
        client.to(`server_${payload.serverId}`).emit('new_group', group);
        return groupId;
    }
    processChannel(gateway) {
        return (channel) => {
            if (channel.type === channel_model_1.ChannelType.Text) {
                channel.messages = [];
            }
            else if (channel.type === channel_model_1.ChannelType.Voice) {
                const room = gateway.of('/').adapter.rooms.get(`channel_${channel.id}`);
                channel.users = [];
                if (room === undefined)
                    return;
                channel.users = Array.from(room)
                    .map(socketId => ({ socketId, userId: gateway.sockets.sockets.get(socketId).handshake.auth.sub }));
            }
        };
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", socket_io_1.Server)
], ServerGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage('get_user_data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "getUserData", null);
__decorate([
    websockets_1.SubscribeMessage('create_server'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "createServer", null);
__decorate([
    websockets_1.SubscribeMessage('create_invitation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "createInvitation", null);
__decorate([
    websockets_1.SubscribeMessage('join_server'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "joinServer", null);
__decorate([
    websockets_1.SubscribeMessage('create_channel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "createChannel", null);
__decorate([
    websockets_1.SubscribeMessage('create_group'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ServerGateway.prototype, "createGroup", null);
ServerGateway = __decorate([
    websockets_1.WebSocketGateway(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], ServerGateway);
exports.ServerGateway = ServerGateway;
//# sourceMappingURL=server.gateway.js.map