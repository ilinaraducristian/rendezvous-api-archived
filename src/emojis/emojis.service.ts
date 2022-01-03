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

  async updateEmoji(userId: string, serverId: string, emojiId: string, emoji: Emoji) {
    const server = await this.serversService.getById(userId, serverId);
    const foundEmoji = server.emojis.find(emoji => emoji._id.toString() === emojiId);
    if (foundEmoji === undefined) throw new EmojiNotFoundException();
    if (foundEmoji.alias !== emoji.alias || foundEmoji.md5 !== emoji.md5) {
      foundEmoji.alias = emoji.alias;
      foundEmoji.md5 = emoji.md5;
      await server.save();
    }
  }

  async deleteEmoji(userId: string, serverId: string, emojiId: string) {
    const server = await this.serversService.getById(userId, serverId);
    const index = server.emojis.findIndex(emoji => emoji._id.toString() === emojiId);
    if (index === -1) throw new EmojiNotFoundException();
    server.emojis.splice(index, 1);
    await server.save();
  }

}
