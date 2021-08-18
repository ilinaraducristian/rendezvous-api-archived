import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
export declare class ChannelGateway {
    private readonly appService;
    server: Server;
    constructor(appService: AppService);
    joinVoiceChannel(client: Socket, { channelId, serverId }: {
        serverId: number;
        channelId: number;
    }): Promise<{
        channelId: number;
        socketId: string;
        userId: string;
    }[]>;
    moveChannel(client: Socket, payload: {
        serverId: number;
        channelId: number;
        groupId: number | null;
        order: number;
    }): Promise<void>;
}
