import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import JoinServerRequest from "../dtos/requests/join-server-request";
import { ServersService } from "../servers/servers.service";
import { FriendshipsService } from "src/friendships/friendships.service";
import Server from "src/entities/server";

@Controller("users")
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly friendshipsService: FriendshipsService,
    private readonly serversService: ServersService
  ) {}

  @Post("servers")
  async joinServer(
    @AuthenticatedUser() user: KeycloakUser,
    @Body() joinServerRequest: JoinServerRequest
  ) {
    return this.serversService.createMember(
      user.sub,
      joinServerRequest.invitation
    );
  }

  @Get("servers")
  async getServers(@AuthenticatedUser() user: KeycloakUser) {
    return (await this.membersService.getServers(user.sub)).map(server => Server.toDTO(server));
  }

  @Get("data")
  async getData(@AuthenticatedUser() user: KeycloakUser) {
    const [friendships, servers] = await Promise.all([
      this.friendshipsService.getAllByUserId(user.sub),
      this.membersService.getServers(user.sub),
    ]);
    return {
      friendships,
      servers: servers.map(server => Server.toDTO(server)),
    };
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
