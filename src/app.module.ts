import { Module } from "@nestjs/common";
import { ServersModule } from "./servers/servers.module";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import MongooseModules from "./MongooseModules";
import { RouterModule } from "@nestjs/core";
import { MessagesModule } from "./messages/messages.module";
import { GroupsModule } from "./groups/groups.module";
import { ChannelsModule } from "./channels/channels.module";
import { GroupChannelsModule } from "./channels/group-channels.module";
import { GroupChannelMessagesModule } from "./messages/group-channel-messages.module";

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
            module: GroupChannelsModule,
            children: [{
              path: ":channelId/messages",
              module: GroupChannelMessagesModule
            }]
          }
        ]
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
])

@Module({
  imports: [
    ServersModule,
    UsersModule,
    MongooseModules,
    MongooseModule.forRoot("mongodb://user:user@127.0.0.1:27017/rendezvous"),
    routes
  ],
  controllers: [],
  providers: []
})
export class AppModule {
}
