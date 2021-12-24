import { Module } from "@nestjs/common";
import { ServersModule } from "./servers/servers.module";
import { MongooseModule } from "@nestjs/mongoose";
import MongooseModules from "./MongooseModules";
import { APP_GUARD, RouterModule } from "@nestjs/core";
import { MessagesModule } from "./messages/messages.module";
import { GroupsModule } from "./groups/groups.module";
import { ChannelsModule } from "./channels/channels.module";
import { GroupChannelsModule } from "./channels/group-channels.module";
import { GroupChannelMessagesModule } from "./messages/group-channel-messages.module";
import { AuthGuard, KeycloakConnectModule } from "nest-keycloak-connect";

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
            path: ':groupId/channels',
            module: GroupChannelsModule,
            children: [{
              path: ':channelId/messages',
              module: GroupChannelMessagesModule,
            }],
          },
        ],
      },
      {
        path: ":serverId/channels",
        module: ChannelsModule,
        children: [{
          path: ":channelId/messages",
          module: MessagesModule
        }]
      }
    ]
  }
]);

@Module({
  imports: [
    ServersModule,
    MongooseModules,
    MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
    routes,
    KeycloakConnectModule.register({
      authServerUrl: "http://127.0.0.1:8080/auth",
      realm: "rendezvous",
      clientId: "rendezvous-api",
      secret: "7841029b-8636-4085-93bd-890ce135aa28"
    })
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ]
})
export class AppModule {
}
