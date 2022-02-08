import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import NewChannelRequest from "../dtos/requests/new-channel-request";
import UpdateChannelRequest from "../dtos/requests/update-channel-request";
import KeycloakUser from "../keycloak-user";
import { ChannelsService } from "./channels.service";

@Controller("servers/:serverId/groups/:groupId/channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async createChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Body() newChannel: NewChannelRequest
  ) {
    await this.channelsService.createChannel(
      user.sub,
      serverId,
      groupId,
      newChannel
    );
  }

  @Put(":channelId")
  async updateChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string,
    @Body() updateChannel: UpdateChannelRequest
  ) {
    await this.channelsService.updateChannel(
      user.sub,
      serverId,
      groupId,
      channelId,
      updateChannel
    );
  }

  @Delete(":channelId")
  async deleteChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string
  ) {
    await this.channelsService.deleteChannel(
      user.sub,
      serverId,
      groupId,
      channelId
    );
  }
}
