import { Controller } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller()
export class MessagesController {

  constructor(
    private readonly messagesService: MessagesService
  ) {
  }

  // @Post()
  // async createNewMessage(
  //   @Param("serverId") serverId: string,
  //   @Param("groupId") groupId: string = null,
  //   @Param("channelId") channelId: string,
  //   @Body() newMessage: NewMessageRequest): Promise<Message> {
  //   try {
  //     const res = await this.messagesService.createMessage(serverId, groupId, channelId, newMessage.text);
  //     return res;
  //   } catch (e) {
  //     if (e === MessageNotEmptyException) {
  //       throw new HttpException("message text must not be empty", HttpStatus.BAD_REQUEST);
  //     } else if (e === ServerNotFoundException) {
  //       throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === GroupNotFoundException) {
  //       throw new HttpException(`group with id '${groupId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === ChannelNotFoundException) {
  //       throw new HttpException(`channel with id '${channelId}' not found`, HttpStatus.NOT_FOUND);
  //     }
  //
  //     throw e;
  //   }
  // }
  //
  // @Get()
  // async getMessages(
  //   @Param("serverId") serverId: string,
  //   @Param("groupId") groupId: string = null,
  //   @Param("channelId") channelId: string,
  //   @Query("offset") offset: string = '0'
  // ) {
  //   try {
  //     const res = await this.messagesService.getMessages(serverId, groupId, channelId, parseInt(offset));
  //     return res;
  //   } catch (e) {
  //     if (e === MessageNotEmptyException) {
  //       throw new HttpException("message text must not be empty", HttpStatus.BAD_REQUEST);
  //     } else if (e === ServerNotFoundException) {
  //       throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === GroupNotFoundException) {
  //       throw new HttpException(`group with id '${groupId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === ChannelNotFoundException) {
  //       throw new HttpException(`channel with id '${channelId}' not found`, HttpStatus.NOT_FOUND);
  //     }
  //
  //     throw e;
  //   }
  // }
  //
  // @Put(":messageId")
  // @HttpCode(204)
  // async updateMessageName(
  //   @Param("serverId") serverId: string,
  //   @Param("groupId") groupId: string = null,
  //   @Param("channelId") channelId: string,
  //   @Param("messageId") id: string,
  //   @Body() message: UpdateMessageRequest
  // ): Promise<void> {
  //   try {
  //     await this.messagesService.updateMessageText(serverId, groupId, channelId, id, message.text);
  //   } catch (e) {
  //     if (e === MessageNotEmptyException) {
  //       throw new HttpException("message name must not be empty", HttpStatus.BAD_REQUEST);
  //     } else if (e === MessageNotFoundException) {
  //       throw new HttpException(`message with id '${id}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === ServerNotFoundException) {
  //       throw new HttpException(`server with id '${serverId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === ChannelNotFoundException) {
  //       throw new HttpException(`channel with id '${channelId}' not found`, HttpStatus.NOT_FOUND);
  //     } else if (e === GroupNotFoundException) {
  //       throw new HttpException(`group with id '${groupId}' not found`, HttpStatus.NOT_FOUND);
  //     }
  //     throw e;
  //   }
  //   return;
  // }
  //
  // @Delete(":messageId")
  // deleteMessage(
  //   @Param("serverId") serverId: string,
  //   @Param("groupId") groupId: string = null,
  //   @Param("channelId") channelId: string,
  //   @Param("messageId") id: string
  // ): Promise<void> {
  //   return this.messagesService.deleteMessage(serverId, groupId, channelId, id);
  // }


}
