import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { ChannelMessagesService } from "./channel-messages.service";
import NewMessageRequest from "../dtos/new-message-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";

@Controller()
export class ChannelMessagesController {

  constructor(
    private readonly messagesService: ChannelMessagesService
  ) {
  }

  @Post()
  async createMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string,
    @Body() newMessage: NewMessageRequest
  ) {
    return this.messagesService.createMessage(user.sub, serverId, groupId, channelId, newMessage.text, newMessage.files);
  }

  @Get()
  async getMessages(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string,
    @Query("offset") offset: number = 0
  ) {
    return this.messagesService.getMessages(user.sub, serverId, groupId, channelId, offset);
  }

  @Delete(":messageId")
  deleteMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Param("channelId") channelId: string,
    @Param("messageId") messageId: string
  ) {
    return this.messagesService.deleteMessage(user.sub, serverId, groupId, channelId, messageId);
  }


}