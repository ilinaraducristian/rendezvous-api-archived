import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import NewGroupRequest from "../dtos/new-group-request";
import Group from "../dtos/group";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import UpdateGroupRequest from "../dtos/update-group-request";

@Controller()
export class GroupsController {

  constructor(private readonly groupsService: GroupsService) {
  }

  @Post()
  async createNewGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() { name }: NewGroupRequest
  ): Promise<Group> {
    return this.groupsService.createGroup(user.sub, serverId, name);
  }

  @Put(":groupId")
  async updateGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") id: string,
    @Body() groupUpdate: UpdateGroupRequest
  ) {
    return this.groupsService.updateGroup(user.sub, serverId, id, groupUpdate);
  }

  @Delete(":groupId")
  async deleteGroup(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("groupId") id: string
  ): Promise<void> {
    return this.groupsService.deleteGroup(user.sub, serverId, id);
  }

}
