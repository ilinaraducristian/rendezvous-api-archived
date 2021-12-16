import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import NewGroupRequest from "../dtos/new-group-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import UpdateGroupRequest from "../dtos/update-group-request";

@Controller()
export class GroupsController {

  constructor() {
  }

  @Post()
  async createNewGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() newGroup: NewGroupRequest
  ) {
  }

  @Put(":groupId")
  async updateGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") id: string,
    @Body() groupUpdate: UpdateGroupRequest
  ) {
  }

  @Delete(":groupId")
  async deleteGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") id: string
  ) {
  }

}
