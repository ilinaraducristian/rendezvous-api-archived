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
exports.ChannelGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const app_service_1 = require("../app.service");
let ChannelGateway = class ChannelGateway {
    constructor(appService) {
        this.appService = appService;
    }
    async joinVoiceChannel(client, { channelId, serverId }) {
        await client.join(`channel_${channelId}`);
        client.to(`server_${serverId}`).emit('user_joined_voice-channel', {
            channelId,
            socketId: client.id,
            userId: client.handshake.auth.sub,
        });
        const room = this.server.of('/').adapter.rooms.get(`channel_${channelId}`);
        if (room === undefined)
            return [];
        return Array.from(room)
            .map(socketId => ({
            channelId,
            socketId,
            userId: this.server.sockets.sockets.get(socketId).handshake.auth.sub,
        }));
    }
    async moveChannel(client, payload) {
        await this.appService.moveChannel(client.handshake.auth.token, payload);
        client.to(`server_${payload.serverId}`).emit('channel_moved', payload);
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", socket_io_1.Server)
], ChannelGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage('join_voice-channel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChannelGateway.prototype, "joinVoiceChannel", null);
__decorate([
    websockets_1.SubscribeMessage('move_channel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChannelGateway.prototype, "moveChannel", null);
ChannelGateway = __decorate([
    websockets_1.WebSocketGateway(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], ChannelGateway);
exports.ChannelGateway = ChannelGateway;
//# sourceMappingURL=channel.gateway.js.map