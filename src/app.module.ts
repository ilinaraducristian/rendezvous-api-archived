import { Module } from "@nestjs/common";
import { ServersModule } from "./servers/servers.module";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD, RouterModule } from "@nestjs/core";
import { GroupsModule } from "./groups/groups.module";
import { ChannelsModule } from "./channels/channels.module";
import { AuthGuard, KeycloakConnectModule } from "nest-keycloak-connect";
import { FriendshipsModule } from "./friendships/friendships.module";
import { FriendshipMessagesModule } from "./friendship-messages/friendship-messages.module";
import { ChannelMessagesModule } from "./channel-messages/channel-messages.module";
import { ServersService } from "./servers/servers.service";
import { GroupsService } from "./groups/groups.service";
import { ChannelsService } from "./channels/channels.service";
import { ChannelMessagesService } from "./channel-messages/channel-messages.service";
import { FriendshipMessagesService } from "./friendship-messages/friendship-messages.service";
import { MembersService } from "./members/members.service";
import Member, { MemberSchema } from "./entities/member";
import Server, { ServerSchema } from "./entities/server";
import ChannelMessage, { ChannelMessageSchema } from "./entities/channel-message";
import Friendship, { FriendshipSchema } from "./entities/friendship";
import FriendshipMessage, { FriendshipMessageSchema } from "./entities/friendship-message";
import { MembersModule } from "./members/members.module";
import SocketIoGateway from "./socket-io/socket-io.gateway";
import { SocketIoService } from "./socket-io/socket-io.service";
import { FriendshipsService } from "./friendships/friendships.service";

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
                path: ":channelId/channel-messages",
                module: ChannelMessagesModule
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: "members",
    module: MembersModule
  },
  {
    path: "friendships",
    module: FriendshipsModule,
    children: [
      {
        path: ":friendshipId/channel-messages",
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
    // MinioModule.register({
    //   endPoint: "127.0.0.1",
    //   port: 9000,
    //   useSSL: false,
    //   accessKey: "minioadmin",
    //   secretKey: "minioadmin"
    // }),
    MongooseModule.forFeature([
      { name: Server.name, schema: ServerSchema },
      { name: ChannelMessage.name, schema: ChannelMessageSchema },
      { name: Member.name, schema: MemberSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: FriendshipMessage.name, schema: FriendshipMessageSchema }
    ]),
    ServersModule,
    GroupsModule,
    ChannelsModule,
    ChannelMessagesModule,
    MembersModule,
    FriendshipsModule,
    FriendshipMessagesModule,
    routes
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    ServersService,
    GroupsService,
    ChannelsService,
    ChannelMessagesService,
    FriendshipMessagesService,
    MembersService,
    SocketIoGateway,
    SocketIoService,
    FriendshipsService
  ]
})
export class AppModule {
}
