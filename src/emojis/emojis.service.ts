import { Injectable } from "@nestjs/common";
import { ServersService } from "../servers/servers.service";
import Emoji from "../dtos/emoji";
import { EmojiNotFoundException } from "../exceptions/NotFoundExceptions";

@Injectable()
export class EmojisService {

  constructor(
    private readonly serversService: ServersService
  ) {
  }

  async createEmojis(userId: string, serverId: string, emojis: Emoji[]) {
    const server = await this.serversService.getById(userId, serverId);
    server.emojis.push(...emojis);
    await server.save();
  }

  async updateEmoji(userId: string, serverId: string, emojiMd5: string, alias: string) {
    const server = await this.serversService.getById(userId, serverId);
    const foundEmoji = server.emojis.find(_emoji => _emoji.md5 === emojiMd5);
    if (foundEmoji === undefined) throw new EmojiNotFoundException();
    if (foundEmoji.alias !== alias) return;
    foundEmoji.alias = alias;
    await server.save();
  }

  async deleteEmojis(userId: string, serverId: string, emojis: string[]) {
    const server = await this.serversService.getById(userId, serverId);
    server.emojis = server.emojis.filter(emoji => !emojis.includes(emoji.md5));
    await server.save();
  }

}
