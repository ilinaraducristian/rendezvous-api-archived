'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function') return Reflect.metadata(k, v);
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.MessageGateway = void 0;
const websockets_1 = require('@nestjs/websockets');
const socket_io_1 = require('socket.io');
const app_service_1 = require('../app.service');
let MessageGateway = class MessageGateway {
  constructor(appService) {
    this.appService = appService;
  }

  async sendMessage(client, payload) {
    const message = await this.appService.sendMessage(client.handshake.auth.sub, payload.channelId, payload.message, payload.isReply, payload.replyId);
    client.to(`server_${message.serverId}`).emit('new_message', message);
    return message;
  }

  async getMessages(client, { channelId, serverId, offset }) {
    return await this.appService.getMessages(client.handshake.auth.sub, serverId, channelId, offset);
  }

  async editMessage(client, { serverId, channelId, messageId, text }) {
    const response = await this.appService.editMessage(client.handshake.auth.sub, messageId, text);
    client.to(`server_${serverId}`).emit('message_edited', { serverId, channelId, messageId, text });
    return response;
  }

  async deleteMessage(client, { serverId, channelId, messageId }) {
    const response = await this.appService.deleteMessage(client.handshake.auth.sub, messageId);
    client.to(`server_${serverId}`).emit('message_deleted', { serverId, channelId, messageId });
    return response;
  }
};
__decorate([
  websockets_1.WebSocketServer(),
  __metadata('design:type', socket_io_1.Server),
], MessageGateway.prototype, 'server', void 0);
__decorate([
  websockets_1.SubscribeMessage('send_message'),
  __metadata('design:type', Function),
  __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
  __metadata('design:returntype', Promise),
], MessageGateway.prototype, 'sendMessage', null);
__decorate([
  websockets_1.SubscribeMessage('get_messages'),
  __metadata('design:type', Function),
  __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
  __metadata('design:returntype', Promise),
], MessageGateway.prototype, 'getMessages', null);
__decorate([
  websockets_1.SubscribeMessage('edit_message'),
  __metadata('design:type', Function),
  __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
  __metadata('design:returntype', Promise),
], MessageGateway.prototype, 'editMessage', null);
__decorate([
  websockets_1.SubscribeMessage('delete_message'),
  __metadata('design:type', Function),
  __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
  __metadata('design:returntype', Promise),
], MessageGateway.prototype, 'deleteMessage', null);
MessageGateway = __decorate([
  websockets_1.WebSocketGateway(),
  __metadata('design:paramtypes', [app_service_1.AppService]),
], MessageGateway);
exports.MessageGateway = MessageGateway;
//# sourceMappingURL=message.gateway.js.map