import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import NewMessageRequest from "../dtos/new-message-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import UpdateMessageRequest from "../dtos/update-message-request";

@Controller()
export class MessagesController {

  constructor(
    private readonly messagesService: MessagesService
  ) {
  }

  @Post()
  async createMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") channelId: string,
    @Body() newMessage: NewMessageRequest
  ) {
  }

  @Put(":messageId")
  async updateMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") channelId: string,
    @Param("messageId") id: string,
    @Body() messageUpdate: UpdateMessageRequest
  ) {
    // return this.serversService.updateServer(user.sub, id, serverUpdate);
  }

  @Delete(":messageId")
  deleteMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") channelId: string,
    @Param("messageId") id: string
  ) {
    // return this.serversService.deleteServer(user.sub, id);
  }


}
