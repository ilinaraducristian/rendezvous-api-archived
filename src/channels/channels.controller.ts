import { Body, Controller, Delete, HttpCode, HttpException, HttpStatus, Param, Post, Put } from "@nestjs/common";
import ServerNotFoundException from "../exceptions/ServerNotFound.exception";
import GroupNotFoundException from "../exceptions/GroupNotFound.exception";
import { ChannelsService } from "./channels.service";
import NewChannelRequest from "../dtos/new-channel-request";
import Channel from "../dtos/channel";
import ChannelNameNotEmptyException from "../exceptions/ChannelNameNotEmpty.exception";
import UpdateChannelRequest from "../dtos/update-channel-request";
import ChannelNotFoundException from "../exceptions/ChannelNotFound.exception";

@Controller()
export class ChannelsController {

  constructor(private readonly channelsService: ChannelsService) {
  }

  @Post()
  async createNewChannel(
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Body() newChannel: NewChannelRequest): Promise<Channel> {
    try {
      const res = await this.channelsService.createChannel(serverId, groupId, newChannel.name, newChannel.type);
      return res;
    } catch (e) {
      if (e === ChannelNameNotEmptyException) {
        throw new HttpException("channel name must not be empty", HttpStatus.BAD_REQUEST);
      } else if (e === ServerNotFoundException) {
        throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
      } else if (e === GroupNotFoundException) {
        throw new HttpException(`group with id '${groupId}' not found`, HttpStatus.NOT_FOUND);
      }

      throw e;
    }
  }

  @Put(":channelId")
  @HttpCode(204)
  async updateChannelName(
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") id: string,
    @Body() channel: UpdateChannelRequest
  ): Promise<void> {
    try {
      await this.channelsService.updateChannelName(serverId, groupId, id, channel.name);
    } catch (e) {
      if (e === ChannelNameNotEmptyException) {
        throw new HttpException("channel name must not be empty", HttpStatus.BAD_REQUEST);
      } else if (e === ChannelNotFoundException) {
        throw new HttpException(`channel with id '${id}' not found`, HttpStatus.NOT_FOUND);
      } else if (e === ServerNotFoundException) {
        throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
      } else if (e === GroupNotFoundException) {
        throw new HttpException(`group with id '${groupId}' not found`, HttpStatus.NOT_FOUND);
      }
      throw e;
    }
    return;
  }

  @Delete(":channelId")
  deleteChannel(
    @Param("serverId") serverId: string,
    @Param("groupId") groupId: string = null,
    @Param("channelId") id: string
  ): Promise<void> {
    return this.channelsService.deleteChannel(serverId, groupId, id);
  }

}
