import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthGuard, KeycloakConnectModule } from "nest-keycloak-connect";
import { ChannelMessagesController } from "./channel-messages/channel-messages.controller";
import { ChannelMessagesService } from "./channel-messages/channel-messages.service";
import { ChannelsController } from "./channels/channels.controller";
import { ChannelsService } from "./channels/channels.service";
import { EmojisService } from "./emojis/emojis.service";
import ChannelMessage, { ChannelMessageSchema } from "./entities/channel-message";
import Friendship, { FriendshipSchema } from "./entities/friendship";
import FriendshipMessage, { FriendshipMessageSchema } from "./entities/friendship-message";
import Member, { MemberSchema } from "./entities/member";
import Server, { ServerSchema } from "./entities/server";
import { FriendshipMessagesController } from "./friendship-messages/friendship-messages.controller";
import { FriendshipMessagesService } from "./friendship-messages/friendship-messages.service";
import { FriendshipsController } from "./friendships/friendships.controller";
import { FriendshipsService } from "./friendships/friendships.service";
import { GroupsController } from "./groups/groups.controller";
import { GroupsService } from "./groups/groups.service";
import { MembersController } from "./members/members.controller";
import { MembersService } from "./members/members.service";
import { ReactionsController } from "./reactions/reactions.controller";
import { ReactionsService } from "./reactions/reactions.service";
import { ServersController } from "./servers/servers.controller";
import { ServersService } from "./servers/servers.service";
import SocketIoGateway from "./socket-io/socket-io.gateway";
import { SocketIoService } from "./socket-io/socket-io.service";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
    KeycloakConnectModule.register({
      authServerUrl: "http://127.0.0.1:8080/auth",
      realm: "rendezvous",
      clientId: "rendezvous-api",
      secret: "tjPGlJ5PDi49SaeCO135QhZC6hSSPMNq",
      useNestLogger: false,
      logLevels: ['error']
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
