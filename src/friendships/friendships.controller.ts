import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import NewFriendshipRequest from "../dtos/requests/new-friendship-request";
import { FriendshipsService } from "./friendships.service";
import UpdateFriendshipRequest from "../dtos/requests/update-friendship-request";

@Controller("friendships")
export class FriendshipsController {

  constructor(
    private readonly friendshipsService: FriendshipsService
  ) {
  }

  @Post()
  createFriendship(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() newFriendship: NewFriendshipRequest
  ) {
    return this.friendshipsService.createFriendship(user.sub, newFriendship.userId);
  }

  @Put(":friendshipId")
  updateFriendship(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") friendshipId: string,
    @Body() updateFriendshipRequest: UpdateFriendshipRequest
  ) {
    return this.friendshipsService.updateFriendship(user.sub, friendshipId, updateFriendshipRequest.status);
  }

  @Delete(":friendshipId")
  deleteFriendship(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("friendshipId") id: string
  ) {
    return this.friendshipsService.deleteFriendship(user.sub, id);
  }

}
