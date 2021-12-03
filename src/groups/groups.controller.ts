import { Body, Controller, Delete, HttpCode, HttpException, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import NewGroupRequest from "../dtos/new-group-request";
import Group from "../dtos/group";
import GroupNameNotEmptyException from "../exceptions/GroupNameNotEmpty.exception";
import UpdateGroupRequest from "../dtos/update-group-request";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";

@Controller()
export class GroupsController {

  constructor(private readonly groupsService: GroupsService) {
  }

  @Post()
  async createNewGroup(@Param("serverId") serverId: string, @Body() newGroup: NewGroupRequest): Promise<Group> {
    try {
      const res = await this.groupsService.createGroup(serverId, newGroup.name);
      return res;
    } catch (e) {
      if (e === GroupNameNotEmptyException) {
        throw new HttpException("group name must not be empty", HttpStatus.BAD_REQUEST);
      }else if(e === ServerNotFoundException) {
        throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
      }
      throw e;
    }
  }

  @Put(":groupId")
  @HttpCode(204)
  async updateGroupName(@Param("serverId") serverId: string, @Param("groupId") id: string, @Body() group: UpdateGroupRequest): Promise<void> {
    try {
      await this.groupsService.updateGroupName(id, group.name);
    } catch (e) {
      if (e === GroupNotFoundException) {
        throw new HttpException(`group with id '${id}' not found`, HttpStatus.NOT_FOUND);
      } else if (e === GroupNameNotEmptyException) {
        throw new HttpException("group name must not be empty", HttpStatus.BAD_REQUEST);
      }else if(e === ServerNotFoundException) {
        throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
      }
      throw e;
    }
    return;
  }

  @Delete(":groupId")
  deleteGroup(@Param("serverId") serverId: string, @Param("groupId") id: string): Promise<void> {
    return this.groupsService.deleteGroup(serverId, id);
  }

}
