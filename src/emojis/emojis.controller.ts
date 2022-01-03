import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { EmojisService } from "./emojis.service";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import NewEmojisRequest from "../dtos/new-emojis-request";
import UpdateEmojiRequest from "../dtos/update-emoji-request";

@Controller()
export class EmojisController {

  constructor(
    private readonly emojisService: EmojisService
  ) {
  }

  @Post()
  createEmojis(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() { emojis }: NewEmojisRequest
  ) {
    return this.emojisService.createEmojis(user.sub, serverId, emojis);
  }

  @Put(":emojiId")
  updateEmoji(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("emojiId") emojiId: string,
    @Body() { emoji }: UpdateEmojiRequest
  ) {
    return this.emojisService.updateEmoji(user.sub, serverId, emojiId, emoji);
  }

  @Delete(":emojiId")
  deleteEmojis(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("emojiId") emojiId: string
  ) {
    return this.emojisService.deleteEmoji(user.sub, serverId, emojiId);
  }

}
