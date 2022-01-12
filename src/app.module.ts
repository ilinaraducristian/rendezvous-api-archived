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
import { EmojisModule } from "./emojis/emojis.module";
import { EmojisService } from "./emojis/emojis.service";
import { ReactionsModule } from "./reactions/reactions.module";
import { ReactionsService } from "./reactions/reactions.service";
import { ServersController } from "./servers/servers.controller";
import { GroupsController } from "./groups/groups.controller";
import { ChannelsController } from "./channels/channels.controller";
import { ChannelMessagesController } from "./channel-messages/channel-messages.controller";
import { FriendshipsController } from "./friendships/friendships.controller";
import { FriendshipMessagesController } from "./friendship-messages/friendship-messages.controller";
import { ReactionsController } from "./reactions/reactions.controller";
import { MembersController } from "./members/members.controller";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
    KeycloakConnectModule.register({
      authServerUrl: "http://127.0.0.1:8080/auth",
      realm: "rendezvous",
      clientId: "rendezvous-api",
      secret: "d3c093d3-b403-44d4-8b62-12f014a0a3d1",
      useNestLogger: false
    }),
    MongooseModule.forFeature([
      { name: Server.name, schema: ServerSchema },
      { name: ChannelMessage.name, schema: ChannelMessageSchema },
      { name: Member.name, schema: MemberSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: FriendshipMessage.name, schema: FriendshipMessageSchema }
    ]),
  ],
  controllers: [
    MembersController,
    ServersController,
    GroupsController,
    ChannelsController,
    ChannelMessagesController,
    ReactionsController,
    FriendshipsController,
    FriendshipMessagesController
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    ServersService,
    GroupsService,
    EmojisService,
    ChannelsService,
    ChannelMessagesService,
    ReactionsService,
    FriendshipMessagesService,
    MembersService,
    SocketIoGateway,
    SocketIoService,
    FriendshipsService
  ]
})
export class AppModule {
}
