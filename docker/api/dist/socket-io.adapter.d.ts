import { INestApplicationContext } from '@nestjs/common';
import { AbstractWsAdapter, MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';

export declare class SocketIoAdapter extends AbstractWsAdapter {
    private readonly corsOrigins;
    private socketIOKeycloakAuth;

    constructor(appOrHttpServer?: INestApplicationContext | any, corsOrigins?: any[] | boolean);

    create(port: number, options?: any & {
        namespace?: string;
        server?: any;
    }): any;

    createIOServer(port: number, options?: any): any;

    bindMessageHandlers(client: any, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void;

    mapPayload(payload: any): {
        data: any;
        ack?: Function;
    };
}
