import { Module } from "@nestjs/common";
import { ServersModule } from "./servers/servers.module";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD, RouterModule } from "@nestjs/core";
import { MessagesModule } from "./messages/messages.module";
import { GroupsModule } from "./groups/groups.module";
import { ChannelsModule } from "./channels/channels.module";
import { AuthGuard, KeycloakConnectModule } from "nest-keycloak-connect";
import { FriendshipsModule } from "./friendships/friendships.module";
import { SocketIoModule } from "./socket-io/socket-io.module";
import { FriendshipMessagesModule } from "./friendship-messages/friendship-messages.module";

export const routes = RouterModule.register([
  {
    path: "servers",
    module: ServersModule,
    children: [
      {
        path: ":serverId/groups",
        module: GroupsModule,
        children: [
          {
            path: ":groupId/channels",
            module: ChannelsModule,
            children: [
              {
                path: ":channelId/messages",
                module: MessagesModule
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: "friendships",
    module: FriendshipsModule,
    children: [
      {
        path: ":friendshipId/messages",
        module: FriendshipMessagesModule
      }
    ]
  }
]);

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
    KeycloakConnectModule.register({
      authServerUrl: "http://127.0.0.1:8080/auth",
      realm: "rendezvous",
      clientId: "rendezvous-api",
      secret: "7841029b-8636-4085-93bd-890ce135aa28"
    }),
    ServersModule,
    GroupsModule,
    ChannelsModule,
    MessagesModule,
    FriendshipsModule,
    SocketIoModule,
    routes,
    FriendshipMessagesModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {
}
