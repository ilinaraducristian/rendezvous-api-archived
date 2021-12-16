import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import NewServerRequest from "../dtos/new-server-request";
import UpdateServerRequest from "../dtos/update-server-request";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import JoinServerRequest from "../dtos/JoinServerRequest";

@Controller()
export class ServersController {

  constructor() {
  }

  @Post()
  async createServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() newServer: NewServerRequest
  ) {
    // return this.serversService.createServer(user.sub, newServer.name);
  }

  @Get()
  async getServers(
    @AuthenticatedUser() user: KeycloakUser
  ) {
    // return this.serversService.getServers(user.sub);
  }

  @Post(":serverId/invitations")
  async createInvitation(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ) {
    // return this.serversService.createInvitation(user.sub, id);
  }

  @Put(":serverId")
  async updateServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string,
    @Body() serverUpdate: UpdateServerRequest
  ) {
    // return this.serversService.updateServer(user.sub, id, serverUpdate);
  }

  @Post("members")
  async createMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() { invitation }: JoinServerRequest
  ) {
    // return this.serversService.createMember(user.sub, invitation);
  }

  @Delete(":serverId/members")
  async deleteMember(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ) {
    // return this.serversService.deleteMember(user.sub, id);
  }

  @Delete(":serverId")
  deleteServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") id: string
  ) {
    // return this.serversService.deleteServer(user.sub, id);
  }

}
