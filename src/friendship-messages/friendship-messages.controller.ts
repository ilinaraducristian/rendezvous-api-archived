import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import { FriendshipMessagesService } from "./friendship-messages.service";
import NewMessageRequest from "../dtos/new-message-request";

@Controller()
export class FriendshipMessagesController {

  constructor(
    private readonly friendshipMessagesService: FriendshipMessagesService
  ) {
  }

  @Post()
  async createMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") friendshipId: string,
    @Body() newMessage: NewMessageRequest
  ) {
    return this.friendshipMessagesService.createMessage(user.sub, friendshipId, newMessage.text);
  }

  @Delete(":messageId")
  deleteMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") friendshipId: string,
    @Param("messageId") messageId: string
  ) {
    return this.friendshipMessagesService.deleteMessage(user.sub, friendshipId, messageId);
  }

}
