"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIoAdapter = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const websockets_1 = require("@nestjs/websockets");
const constants_1 = require("@nestjs/websockets/constants");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const socket_io_1 = require("socket.io");
const node_fetch_1 = require("node-fetch");
class SocketIoAdapter extends websockets_1.AbstractWsAdapter {
    constructor(appOrHttpServer, corsOrigins = []) {
        super(appOrHttpServer);
        this.corsOrigins = corsOrigins;
    }
    create(port, options) {
        if (!options) {
            return this.createIOServer(port);
        }
        const { namespace, server, ...opt } = options;
        return server && shared_utils_1.isFunction(server.of)
            ? server.of(namespace)
            : namespace
                ? this.createIOServer(port, opt).of(namespace)
                : this.createIOServer(port, opt);
    }
    createIOServer(port, options) {
        let server;
        if (this.httpServer && port === 0) {
            server = new socket_io_1.Server(this.httpServer, {
                cors: {
                    origin: this.corsOrigins,
                    methods: ['GET', 'POST'],
                    credentials: true,
                },
                cookie: {
                    httpOnly: true,
                    path: '/',
                },
                maxHttpBufferSize: 1e6,
            });
        }
        else {
            server = new socket_io_1.Server(port, options);
        }
        server.use(this.socketIOKeycloakAuth({
            tokenIntrospectionEndpoint: process.env.TOKEN_INTROSPECTION_ENDPOINT,
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            secret: process.env.KEYCLOAK_CLIENT_SECRET,
        }));
        return server;
    }
    bindMessageHandlers(client, handlers, transform) {
        const disconnect$ = rxjs_1.fromEvent(client, constants_1.DISCONNECT_EVENT).pipe(operators_1.share(), operators_1.first());
        handlers.forEach(({ message, callback }) => {
            const source$ = rxjs_1.fromEvent(client, message).pipe(operators_1.mergeMap((payload) => {
                const { data, ack } = this.mapPayload(payload);
                return transform(callback(data, ack)).pipe(operators_1.filter((response) => !shared_utils_1.isNil(response)), operators_1.map((response) => [response, ack]));
            }), operators_1.takeUntil(disconnect$));
            source$.subscribe(([response, ack]) => {
                if (response.event) {
                    return client.emit(response.event, response.data);
                }
                shared_utils_1.isFunction(ack) && ack(response);
            });
        });
    }
    mapPayload(payload) {
        if (!Array.isArray(payload)) {
            return { data: payload };
        }
        const lastElement = payload[payload.length - 1];
        const isAck = shared_utils_1.isFunction(lastElement);
        if (isAck) {
            const size = payload.length - 1;
            return {
                data: size === 1 ? payload[0] : payload.slice(0, size),
                ack: lastElement,
            };
        }
        return { data: payload };
    }
    socketIOKeycloakAuth(options) {
        return async (socket, next) => {
            const token = socket.handshake.auth.token;
            try {
                let response = await node_fetch_1.default(process.env.TOKEN_INTROSPECTION_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `token=${token}&client_id=${options.clientId}&client_secret=${options.secret}`,
                });
                response = await response.json();
                if (!response.active) {
                    console.log('invalid token');
                    return next(new Error('Invalid token'));
                }
                socket.handshake.auth.username = response.username;
                socket.handshake.auth.sub = response.sub;
                next();
            }
            catch (err) {
                console.log('Keycloak token introspection error:');
                console.log(err);
                next(new Error('500 Internal Server Error'));
            }
        };
    }
}
exports.SocketIoAdapter = SocketIoAdapter;
//# sourceMappingURL=socket-io.adapter.js.map