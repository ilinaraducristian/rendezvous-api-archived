import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { MembersService } from "./members.service";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import JoinServerRequest from "../dtos/JoinServerRequest";
import { ServersService } from "../servers/servers.service";

@Controller()
export class MembersController {

  constructor(
    private readonly membersService: MembersService,
    private readonly serversService: ServersService
  ) {
  }

  @Post("servers")
  async joinServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() joinServerRequest: JoinServerRequest
  ) {
    await this.serversService.createMember(user.sub, joinServerRequest.invitation);
  }

  @Get("servers")
  getServers(
    @AuthenticatedUser() user: KeycloakUser
  ) {
    return this.membersService.getServers(user.sub);
  }

  @Put("servers/:serverId")
  async changeServerOrder(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() { order }: { order: number }
  ) {
    // TODO implementation
  }

  @Delete("servers/:serverId")
  async leaveServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string
  ) {
    await this.serversService.deleteMember(user.sub, serverId);
  }

}
