import { INestApplicationContext } from "@nestjs/common";
import { isFunction, isNil } from "@nestjs/common/utils/shared.utils";
import { AbstractWsAdapter, MessageMappingProperties } from "@nestjs/websockets";
import { DISCONNECT_EVENT } from "@nestjs/websockets/constants";
import { fromEvent, Observable } from "rxjs";
import { filter, first, map, mergeMap, share, takeUntil } from "rxjs/operators";
import { Server } from "socket.io";

export class SocketIoAdapter extends AbstractWsAdapter {
  constructor(
    appOrHttpServer?: INestApplicationContext | any,
    private readonly corsOrigins: any[] | boolean = []
  ) {
    super(appOrHttpServer);
  }

  public create(
    port: number,
    options?: any & { namespace?: string; server?: any }
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
          methods: ["GET", "POST"],
          credentials: true
        },
        cookie: {
          httpOnly: true,
          path: "/"
        },
        // Allow 1MB of data per request.
        maxHttpBufferSize: 1e6
      });

      return server;
    } else {
      server = new Server(port, options);
    }
    // server.use(this.socketIOKeycloakAuth({
    //   tokenIntrospectionEndpoint: config.keycloak.tokenIntrospectionEndpoint,
    //   clientId: config.keycloak.clientId,
    //   secret: config.keycloak.secret
    // }));
    return server;
  }

  private socketIOKeycloakAuth(options: any) {
    return async (socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        let response: any = await fetch(options.tokenIntrospectionEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `token=${token}&client_id=${options.clientId}&client_secret=${options.secret}`
        });
        response = await response.json();
        if (!response.active) {
          console.log("invalid token");
          return next(new Error("Invalid token"));
        }
        socket.handshake.auth.username = response.username;
        socket.handshake.auth.userId = response.sub;
        next();
      } catch (err) {
        console.log("Keycloak token introspection error:");
        console.log(err);
        next(new Error("500 Internal Server Error"));
      }
    };
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
      share(),
      first()
    );

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload);
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack])
          );
        }),
        takeUntil(disconnect$)
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
        ack: lastElement
      };
    }
    return { data: payload };
  }
}
