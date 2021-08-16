import { Server, Socket } from 'socket.io';
import { AppService } from '../app.service';
import { Router } from 'mediasoup/lib/Router';
import { DtlsParameters } from 'mediasoup/lib/WebRtcTransport';

export declare class MediasoupGateway {
    server: Server;
    private readonly appService;
    private readonly router;

    constructor(appService: AppService, router: Router);

    getRouterCapabilities(): {
        routerRtpCapabilities: import('mediasoup/lib/RtpParameters').RtpCapabilities;
    };

    createTransport(client: Socket, { type }: {
        type: string;
    }): Promise<{
        transportParameters: {
            id: string;
            iceParameters: import('mediasoup/lib/WebRtcTransport').IceParameters;
            iceCandidates: import('mediasoup/lib/WebRtcTransport').IceCandidate[];
            dtlsParameters: DtlsParameters;
            sctpParameters: import('mediasoup/lib/SctpParameters').SctpParameters;
        };
    }>;

    connectSendTransport(client: any, { type, dtlsParameters, id }: {
        type: string;
        dtlsParameters: DtlsParameters;
        id: string;
    }): Promise<number>;

    createProducer(client: any, payload: any): Promise<{
        producerId: any;
    }>;

    createConsumer(client: any, { transportId, socketId, ...payload }: {
        [x: string]: any;
        transportId: any;
        socketId: any;
    }): Promise<{
        consumerParameters: {
            id: any;
            producerId: any;
            rtpParameters: any;
            kind: any;
            appData: any;
        };
    }>;

    resumeConsumer(client: Socket, { id }: {
        id: string;
    }): Promise<number>;
}
