import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { EmojisService } from "./emojis.service";
import { AuthenticatedUser } from "nest-keycloak-connect";
import KeycloakUser from "../keycloak-user";
import NewEmojisRequest from "../dtos/new-emojis-request";
import DeleteEmojisRequest from "../dtos/delete-emojis-request";
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

  @Put(":emojiMd5")
  updateEmoji(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Param("emojiMd5") emojiMd5: string,
    @Body() { alias }: UpdateEmojiRequest
  ) {
    return this.emojisService.updateEmoji(user.sub, serverId, emojiMd5, alias);
  }

  @Delete()
  deleteEmojis(
    @AuthenticatedUser() user: KeycloakUser,
    @Param("serverId") serverId: string,
    @Body() { emojisMd5s }: DeleteEmojisRequest
  ) {
    return this.emojisService.deleteEmojis(user.sub, serverId, emojisMd5s);
  }

}
