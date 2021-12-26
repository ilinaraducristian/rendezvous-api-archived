import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import NewChannelRequest from "../dtos/new-channel-request";
import UpdateChannelRequest from "../dtos/update-channel-request";
import { ChannelsService } from "./channels.service";

@Controller()
export class ChannelsController {

  constructor(
    private readonly channelsService: ChannelsService
  ) {
  }

  @Post()
  async createChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Body() newChannel: NewChannelRequest
  ) {
    return this.channelsService.createChannel(user.sub, serverId, groupId, newChannel);
  }

  @Put(":channelId")
  async updateChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string,
    @Body() updateChannel: UpdateChannelRequest
  ) {
    return this.channelsService.updateChannel(user.sub, serverId, groupId, channelId, updateChannel);
  }

  @Delete(":channelId")
  async deleteChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string
  ) {
    return this.channelsService.deleteChannel(user.sub, serverId, groupId, channelId);
  }

}
