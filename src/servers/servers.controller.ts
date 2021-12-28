import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import NewServerRequest from "../dtos/new-server-request";
import UpdateServerRequest from "../dtos/update-server-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import JoinServerRequest from "../dtos/JoinServerRequest";
import { ServersService } from "./servers.service";

@Controller()
export class ServersController {

  constructor(
    private readonly serversService: ServersService
  ) {
  }

  @Post()
  async createServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() newServer: NewServerRequest
  ) {
    return this.serversService.createServer(user.sub, newServer.name);
  }

  @Post(":serverId/invitations")
  async createInvitation(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string
  ) {
    return this.serversService.createInvitation(user.sub, serverId);
  }

  @Put(":serverId")
  async updateServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() serverUpdate: UpdateServerRequest
  ) {
    return this.serversService.updateServer(user.sub, serverId, serverUpdate);
  }

  @Post("members")
  async createMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() joinServerRequest: JoinServerRequest
  ) {
    return this.serversService.createMember(user.sub, joinServerRequest.invitation);
  }

  @Delete(":serverId/members")
  async deleteMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string
  ) {
    return this.serversService.deleteMember(user.sub, serverId);
  }

  @Delete(":serverId")
  deleteServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string
  ) {
    return this.serversService.deleteServer(user.sub, serverId);
  }

}
