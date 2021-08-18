import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import Message from '../models/message.model';
export declare class MessageGateway {
    private readonly appService;
    server: Server;
    constructor(appService: AppService);
    sendMessage(client: Socket, payload: {
        channelId: number;
        message: string;
        isReply: boolean;
        replyId: number | null;
    }): Promise<Message>;
    getMessages(client: Socket, { channelId, serverId, offset }: {
        channelId: any;
        serverId: any;
        offset: any;
    }): Promise<Message[]>;
    editMessage(client: Socket, { serverId, channelId, messageId, text, }: {
        serverId: number;
        channelId: number;
        messageId: number;
        text: string;
    }): Promise<import("typeorm").UpdateResult>;
    deleteMessage(client: Socket, { serverId, channelId, messageId, }: {
        serverId: number;
        channelId: number;
        messageId: number;
    }): Promise<import("typeorm").DeleteResult>;
}
