import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import { FriendshipsMessagesService } from "./friendships-messages.service";
import NewMessageRequest from "../dtos/new-message-request";

@Controller(":friendshipId/messages")
export class FriendshipsMessagesController {

  constructor(
    private readonly friendshipsMessagesService: FriendshipsMessagesService
  ) {
  }

  @Post()
  async createMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") friendshipId: string,
    @Body() newMessage: NewMessageRequest
  ) {
    return this.friendshipsMessagesService.createMessage(user.sub, friendshipId, newMessage.text);
  }

  @Delete(":messageId")
  deleteMessage(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") friendshipId: string,
    @Param("messageId") messageId: string
  ) {
    return this.friendshipsMessagesService.deleteMessage(user.sub, friendshipId, messageId);
  }

}
