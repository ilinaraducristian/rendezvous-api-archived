import { INestApplicationContext, Inject } from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { AbstractWsAdapter, MessageMappingProperties } from '@nestjs/websockets';
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants';
import { fromEvent, Observable } from 'rxjs';
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators';
import { Server } from 'socket.io';
import { AppService } from 'src/services/app/app.service';
import tokens from 'src/tokens';

export class SocketIoAdapter extends AbstractWsAdapter {

  @Inject('AppService')
  private readonly appService: AppService;

  constructor(
    appOrHttpServer?: INestApplicationContext | any,
    private readonly corsOrigins: any[] | boolean = [],
  ) {
    super(appOrHttpServer);
  }

  public create(
    port: number,
    options?: any & { namespace?: string; server?: any },
  ): any {
    if (!options) {
      return this.createIOServer(port);
    }
    const { namespace, server, ...opt } = options;
    return server && isFunction(server.of)
      ? server.of(namespace)
      : namespace
        ? this.createIOServer(port, opt).of(namespace)
        : this.createIOServer(port, opt);
  }

  public createIOServer(port: number, options?: any): any {
    let server: Server;
    if (this.httpServer && port === 0) {
      server = new Server(this.httpServer, {
        cors: {
          origin: this.corsOrigins,
          methods: ['GET', 'POST'],
          credentials: true,
        },
        cookie: {
          httpOnly: true,
          path: '/',
        },
        // Allow 1MB of data per request.
        maxHttpBufferSize: 1e6,
      });
    } else {
      server = new Server(port, options);
    }

    server.on('connect', (socket) => {
      socket.setMaxListeners(12);
    });

    server.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const tokenIndex = tokens.findIndex(_token => _token[0] === token);
      if (tokenIndex === -1)
        return next(new Error('Invalid token'));
      socket.handshake.auth.sub = tokens[tokenIndex][1];
      tokens.splice(tokenIndex, 1);
      next();
    });
    return server;
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
      share(),
      first(),
    );

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload);
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack]),
          );
        }),
        takeUntil(disconnect$),
      );
      source$.subscribe(([response, ack]) => {
        if (response.event) {
          return client.emit(response.event, response.data);
        }
        isFunction(ack) && ack(response);
      });
    });
  }

  public mapPayload(payload: any): { data: any; ack?: Function } {
    if (!Array.isArray(payload)) {
      return { data: payload };
    }
    const lastElement = payload[payload.length - 1];
    const isAck = isFunction(lastElement);
    if (isAck) {
      const size = payload.length - 1;
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement,
      };
    }
    return { data: payload };
  }
}
