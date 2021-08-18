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
exports.MediasoupGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const app_service_1 = require("../app.service");
const Router_1 = require("mediasoup/lib/Router");
const webRtcTransportOptions = {
    listenIps: [{ ip: '192.168.1.4' }],
    enableTcp: true,
    preferUdp: true,
};
let MediasoupGateway = class MediasoupGateway {
    constructor(appService, router) {
        this.appService = appService;
        this.router = router;
    }
    getRouterCapabilities() {
        return { routerRtpCapabilities: this.router.rtpCapabilities };
    }
    async createTransport(client, { type }) {
        const transport = await this.router.createWebRtcTransport(webRtcTransportOptions);
        if (type === 'send') {
            client.data.sendTransport = transport;
        }
        else if (type === 'recv') {
            client.data.recvTransports.push(transport);
        }
        return {
            transportParameters: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
                sctpParameters: transport.sctpParameters,
            },
        };
    }
    async connectSendTransport(client, { type, dtlsParameters, id, }) {
        if (type === 'send') {
            await client.data.sendTransport.connect({ dtlsParameters });
        }
        else if (type === 'recv') {
            await client.data.recvTransports.find(transport => transport.id === id).connect({ dtlsParameters });
        }
        return 0;
    }
    async createProducer(client, payload) {
        client.data.producer = await client.data.sendTransport.produce(payload);
        return { producerId: client.data.producer.id };
    }
    async createConsumer(client, { transportId, socketId, ...payload }) {
        const producerId = this.server.sockets.sockets.get(socketId).data.producer.id;
        const consumer = await client.data.recvTransports
            .find(transport => transport.id === transportId)
            .consume({ producerId, ...payload, paused: true });
        client.data.consumers.push(consumer);
        return {
            consumerParameters: {
                id: consumer.id,
                producerId,
                rtpParameters: consumer.rtpParameters,
                kind: consumer.kind,
                appData: consumer.appData,
            },
        };
    }
    async resumeConsumer(client, { id }) {
        await client.data.consumers.find(consumer => consumer.id === id).resume();
        return 0;
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", socket_io_1.Server)
], MediasoupGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage('get_router_capabilities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediasoupGateway.prototype, "getRouterCapabilities", null);
__decorate([
    websockets_1.SubscribeMessage('create_transport'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "createTransport", null);
__decorate([
    websockets_1.SubscribeMessage('connect_transport'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "connectSendTransport", null);
__decorate([
    websockets_1.SubscribeMessage('create_producer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "createProducer", null);
__decorate([
    websockets_1.SubscribeMessage('create_consumer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "createConsumer", null);
__decorate([
    websockets_1.SubscribeMessage('resume_consumer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "resumeConsumer", null);
MediasoupGateway = __decorate([
    websockets_1.WebSocketGateway(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        Router_1.Router])
], MediasoupGateway);
exports.MediasoupGateway = MediasoupGateway;
//# sourceMappingURL=mediasoup.gateway.js.map