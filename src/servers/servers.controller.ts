import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import NewServerRequest from "../dtos/new-server-request";
import { ServersService } from "./servers.service";
import Server from "../dtos/server";
import UpdateServerRequest from "../dtos/update-server-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import JoinServerRequest from "../dtos/JoinServerRequest";

@Controller()
export class ServersController {

  constructor(private readonly serversService: ServersService) {
  }

  @Post()
  async createNewServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() newServer: NewServerRequest
  ): Promise<Server> {
    return this.serversService.createServer(user.sub, newServer.name);
  }

  @Get()
  async getServers(
    @AuthenticatedUser() user: KeycloakUser
  ): Promise<Server[]> {
    return this.serversService.getServers(user.sub);
  }

  @Post(":serverId/invitations")
  async createInvitation(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ): Promise<{
    invitation: string
    invitation_expiration_date: string
  }> {
    return this.serversService.createInvitation(user.sub, id);
  }

  @Put(":serverId")
  async updateServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string,
    @Body() serverUpdate: UpdateServerRequest
  ) {
    return this.serversService.updateServer(user.sub, id, serverUpdate);
  }

  @Post("members")
  async createMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() { invitation }: JoinServerRequest
  ): Promise<Server> {
    return this.serversService.createMember(user.sub, invitation);
  }

  @Delete(":serverId/members")
  async deleteMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ): Promise<void> {
    return this.serversService.deleteMember(user.sub, id);
  }

  @Delete(":serverId")
  deleteServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ): Promise<void> {
    return this.serversService.deleteServer(user.sub, id);
  }

}
