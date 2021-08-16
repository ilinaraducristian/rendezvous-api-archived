import { Connection, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserServersData } from './models/server.model';
import { ChannelType } from './models/channel.model';
import Message from './models/message.model';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';

export declare class AppService {
    private static processQuery;
    private connection;
    private channelRepository;
    private messageRepository;
    private keycloakRepository;
    private addUsersDetailsToResult;

    constructor(connection: Connection, channelRepository: Repository<ChannelEntity>, messageRepository: Repository<MessageEntity>, keycloakRepository: Repository<UserEntity>);

    createInvitation(userId: string, serverId: number): Promise<string>;

    createGroup(userId: string, serverId: number, name: string): Promise<number>;

    createChannel(userId: string, serverId: number, groupId: number | null, type: ChannelType, name: string): Promise<number>;

    moveChannel(userId: string, payload: any): Promise<void>;

    sendMessage(userId: string, channelId: number, message: string, isReply: boolean, replyId: number | null): Promise<Message>;

    createServer(userId: string, name: string): Promise<UserServersData>;

    getUserData(userId: string): Promise<UserServersData>;

    getMessages(userId: string, serverId: number, channelId: number, offset: number): Promise<Message[]>;

    joinServer(userId: string, invitation: string): Promise<UserServersData>;

    editMessage(userId: string, messageId: number, text: string): Promise<import('typeorm').UpdateResult>;

    deleteMessage(userId: string, messageId: number): Promise<import('typeorm').DeleteResult>;
}
