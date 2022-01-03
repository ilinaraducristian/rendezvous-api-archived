import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import NewGroupRequest from "../dtos/new-group-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import UpdateGroupRequest from "../dtos/update-group-request";
import { GroupsService } from "./groups.service";

@Controller()
export class GroupsController {

  constructor(
    private readonly groupsService: GroupsService
  ) {
  }

  @Post()
  async createNewGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() newGroup: NewGroupRequest
  ) {
    await this.groupsService.createGroup(user.sub, serverId, newGroup.name);
  }

  @Put(":groupId")
  async updateGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string,
    @Body() groupUpdate: UpdateGroupRequest
  ) {
    await this.groupsService.updateGroup(user.sub, serverId, groupId, groupUpdate);
  }

  @Delete(":groupId")
  async deleteGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string
  ) {
    await this.groupsService.deleteGroup(user.sub, serverId, groupId);
  }

}
