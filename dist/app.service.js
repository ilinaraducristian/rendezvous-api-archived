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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const channel_model_1 = require("./models/channel.model");
const channel_entity_1 = require("./entities/channel.entity");
const message_entity_1 = require("./entities/message.entity");
let AppService = AppService_1 = class AppService {
    constructor(connection, channelRepository, messageRepository, keycloakRepository) {
        this.connection = connection;
        this.channelRepository = channelRepository;
        this.messageRepository = messageRepository;
        this.keycloakRepository = keycloakRepository;
    }
    static processQuery(result) {
        const serversTable = result[0].map((server) => ({
            ...server,
            channels: [],
            groups: [],
            members: [],
        }));
        const usersTable = [];
        result[3].forEach((member) => {
            const server = serversTable.find(server => server.id === member.serverId);
            if (server === undefined)
                return;
            if (server.members.findIndex(m1 => m1.id === member.id) === -1)
                server.members.push({
                    id: member.id,
                    userId: member.userId,
                    serverId: member.serverId,
                });
        });
        result[4].forEach((user) => {
            const existingUserIndex = usersTable.findIndex(usr => usr.id === user.ID);
            if (existingUserIndex === -1)
                usersTable.push({
                    id: user.ID,
                    username: user.USERNAME,
                    firstName: user.FIRST_NAME,
                    lastName: user.LAST_NAME,
                });
        });
        result[1].forEach((group) => {
            const server = serversTable.find(server => server.id === group.serverId);
            if (server === undefined)
                return;
            server.groups.push({ ...group, channels: [] });
        });
        result[2].forEach((channel) => {
            if (channel.type === channel_model_1.ChannelType.Text) {
                channel.messages = [];
            }
            const server = serversTable.find(server => server.id === channel.serverId);
            if (channel.groupId === null)
                server.channels.push(channel);
            else {
                const group = server.groups.find(group => group.id === channel.groupId);
                if (group === undefined)
                    return;
                group.channels.push(channel);
            }
        });
        return {
            servers: serversTable,
            users: usersTable,
        };
    }
    async createInvitation(userId, serverId) {
        return this.connection
            .query('SELECT create_invitation(?,?)', [userId, serverId])
            .then((result) => Object.entries(result[0])[0][1]);
    }
    async createGroup(userId, serverId, name) {
        return this.connection
            .query('SELECT create_group(?,?,?)', [userId, serverId, name])
            .then((result) => Object.entries(result[0])[0][1]);
    }
    async createChannel(userId, serverId, groupId, type, name) {
        return this.connection
            .query('SELECT create_channel(?,?,?,?,?)', [
            userId,
            serverId,
            groupId,
            type,
            name,
        ])
            .then((result) => Object.entries(result[0])[0][1]);
    }
    async moveChannel(userId, payload) {
        await this.channelRepository.update(payload.channelId, { order: payload.order, group_id: payload.groupId });
    }
    async sendMessage(userId, channelId, message, isReply, replyId) {
        const result = await this.connection.query('CALL send_message(?,?,?,?,?)', [
            userId,
            channelId,
            message,
            isReply,
            replyId,
        ]);
        return result[0][0];
    }
    async createServer(userId, name) {
        let result = await this.connection.query('CALL create_server(?,?)', [
            userId,
            name,
        ]);
        await this.addUsersDetailsToResult(result);
        return AppService_1.processQuery(result);
    }
    async getUserData(userId) {
        let result = await this.connection.query('CALL get_user_data(?)', [userId]);
        await this.addUsersDetailsToResult(result);
        return AppService_1.processQuery(result);
    }
    async getMessages(userId, serverId, channelId, offset) {
        const result = await this.connection.query('CALL get_messages(?,?,?,?)', [
            userId,
            serverId,
            channelId,
            offset,
        ]);
        return result[0];
    }
    async joinServer(userId, invitation) {
        let result = await this.connection.query('CALL join_server(?,?)', [userId, invitation]);
        await this.addUsersDetailsToResult(result);
        return AppService_1.processQuery(result);
    }
    editMessage(userId, messageId, text) {
        return this.messageRepository.update(messageId, { text });
    }
    deleteMessage(userId, messageId) {
        return this.messageRepository.delete(messageId);
    }
    async addUsersDetailsToResult(result) {
        const usersIds = result[3].map(member => ({ ID: member.userId })).filter((user, index, array) => array.indexOf(user) === index);
        result[4] = await this.keycloakRepository.find({
            select: ['ID', 'USERNAME', 'FIRST_NAME', 'LAST_NAME'],
            where: usersIds,
        });
    }
};
AppService = AppService_1 = __decorate([
    common_1.Injectable(),
    __param(1, typeorm_2.InjectRepository(channel_entity_1.ChannelEntity)),
    __param(2, typeorm_2.InjectRepository(message_entity_1.MessageEntity)),
    __param(3, typeorm_2.InjectRepository(user_entity_1.UserEntity, 'keycloakConnection')),
    __metadata("design:paramtypes", [typeorm_1.Connection,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map