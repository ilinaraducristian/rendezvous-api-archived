import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import NewChannelRequest from "../dtos/new-channel-request";
import UpdateChannelRequest from "../dtos/update-channel-request";

@Controller()
export class ChannelsController {

  constructor() {
  }

  @Post()
  async createChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Body() newChannel: NewChannelRequest
  ) {
  }

  @Put(":channelId")
  async updateChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("channelId") channelId: string,
    @Body() updateChannel: UpdateChannelRequest
  ) {
  }

  @Delete(":channelId")
  async deleteChannel(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("channelId") channelId: string
  ) {
  }

  //
  // @Put(":channelId")
  // async updateChannel(
  //   @AuthenticatedUser() user: KeycloakUser,
  //   @Param("serverId") serverId: string,
  //   @Param("channelId") id: string,
  //   @Body() channel: ChannelUpdate
  // ): Promise<Channel> {
  //   return this.channelsService.updateChannel(user.sub, serverId, id, channel);
  // }
  //
  // @Delete(":channelId")
  // async deleteChannel(
  //   @AuthenticatedUser() user: KeycloakUser,
  //   @Param("serverId") serverId: string,
  //   @Param("groupId") groupId: string,
  //   @Param("channelId") id: string
  // ): Promise<void> {
  //   return this.channelsService.deleteChannel(user.sub, serverId, groupId, id);
  // }

}
