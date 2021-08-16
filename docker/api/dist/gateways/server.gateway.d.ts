import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import { UserServersData } from '../models/server.model';

export declare class ServerGateway implements OnGatewayConnection<Socket> {
    server: Server;
    private readonly appService;
    private processChannel;

    constructor(appService: AppService);

    handleConnection(client: Socket, ...args: any[]): Promise<void>;

    getUserData(client: Socket): Promise<UserServersData>;

    createServer(client: Socket, payload: {
        name: string;
    }): Promise<UserServersData>;

    createInvitation(client: Socket, { serverId }: {
        serverId: any;
    }): Promise<{
        invitation: string;
    }>;

    joinServer(client: Socket, payload: {
        invitation: string;
    }): Promise<UserServersData>;

    createChannel(client: Socket, payload: {
        serverId: number;
        groupId: number | null;
        channelName: string;
    }): Promise<{
        channelId: number;
    }>;

    createGroup(client: Socket, payload: {
        serverId: number;
        groupName: string;
    }): Promise<number>;
}
