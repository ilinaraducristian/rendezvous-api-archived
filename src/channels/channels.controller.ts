import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import NewChannelRequest from "../dtos/new-channel-request";
import Channel from "../dtos/channel";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import ChannelUpdate from "../dtos/channel-update";

@Controller()
export class ChannelsController {

  constructor(private readonly channelsService: ChannelsService) {
  }

  @Post()
  async createNewChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Body() { name, type }: NewChannelRequest
  ): Promise<Channel> {
    return this.channelsService.createChannel(user.sub, serverId, groupId, name, type);
  }

  @Put(":channelId")
  async updateChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("channelId") id: string,
    @Body() channel: ChannelUpdate
  ): Promise<Channel> {
    return this.channelsService.updateChannel(user.sub, serverId, id, channel);
  }

  @Delete(":channelId")
  async deleteChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") id: string
  ): Promise<void> {
    return this.channelsService.deleteChannel(user.sub, serverId, groupId, id);
  }

}
