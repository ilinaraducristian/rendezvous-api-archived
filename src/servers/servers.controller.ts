import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put } from "@nestjs/common";
import NewServerRequest from "../dtos/new-server-request";
import { ServersService } from "./servers.service";
import Server from "../dtos/server";
import UpdateServerRequest from "../dtos/update-server-request";
import ServerNameNotEmptyException from "../exceptions/ServerNameNotEmpty.exception";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";

@Controller()
export class ServersController {

  constructor(private readonly serversService: ServersService) {
  }

  @Post()
  async createNewServer(@Body() newServer: NewServerRequest): Promise<Server> {
    try {
      const res = await this.serversService.createServer(newServer.name);
      return res;
    } catch (e) {
      if (e === ServerNameNotEmptyException) {
        throw new HttpException("server name must not be empty", HttpStatus.BAD_REQUEST);
      }
      throw e;
    }
  }

  @Get(":serverId")
  async getServer(@Param("serverId") id: string) {
    try {
      const res = await this.serversService.getFullServer(id);
      return res;
    } catch (e) {
      if (e === ServerNotFoundException) {
        throw new HttpException(`server with id '${id}' not found`, HttpStatus.NOT_FOUND);
      }
      throw e;
    }
  }

  @Put(":serverId")
  @HttpCode(204)
  async updateServerName(@Param("serverId") id: string, @Body() server: UpdateServerRequest): Promise<void> {
    try {
      await this.serversService.updateServerName(id, server.name);
    } catch (e) {
      if (e === ServerNotFoundException) {
        throw new HttpException(`server with id '${id}' not found`, HttpStatus.NOT_FOUND);
      } else if (e === ServerNameNotEmptyException) {
        throw new HttpException("server name must not be empty", HttpStatus.BAD_REQUEST);
      }
      throw e;
    }
    return;
  }

  @Delete(":serverId")
  deleteServer(@Param("serverId") id: string): Promise<void> {
    return this.serversService.deleteServer(id);
  }

}
