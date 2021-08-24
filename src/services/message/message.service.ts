import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { MessageEntity } from '../../entities/message.entity';
import { ObjectStoreService } from '../object-store/object-store.service';
import { FrontendMessage } from '../../models/message.model';

@Injectable()
export class MessageService {

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly objectStoreService: ObjectStoreService,
  ) {
  }

  async sendMessage(
    userId: string,
    channelId: number,
    message: string,
    isReply: boolean,
    replyId: number | null,
    image: string | null,
  ): Promise<FrontendMessage> {
    let imageMd5;
    if (image !== null) {
      imageMd5 = await this.objectStoreService.putImage(image);
    }
    const result = await this.databaseService.send_message(
      userId,
      channelId,
      message,
      isReply,
      replyId,
      image === null ? null : imageMd5,
    );

    const storedMessage = Object.assign({ image: null }, result[0][0]);
    storedMessage.image = image;
    delete storedMessage.imageMd5;
    return storedMessage;
  }

  async getMessages(
    userId: string,
    serverId: number,
    channelId: number,
    offset: number,
  ): Promise<FrontendMessage[]> {
    const result = await this.databaseService.get_messages(
      userId,
      serverId,
      channelId,
      offset,
    );
    const messages = result[0].map((message) => {
      const newMessage = Object.assign({ image: null }, message);
      newMessage.image = message.imageMd5;
      delete newMessage.imageMd5;
      return newMessage;
    });
    const promises = [];
    messages.forEach(message => {
      const newMessage = Object.assign({ image: null }, message);
      if (newMessage.image === null) return;
      promises.push(this.objectStoreService.getImage(newMessage.image).then(data => {
        newMessage.image = data;
      }));
    });
    await Promise.all(promises);
    return messages;
  }

  editMessage(userId: string, messageId: number, text: string) {
    return this.messageRepository.update(messageId, { text });
  }

  deleteMessage(userId: string, messageId: number) {
    return this.messageRepository.delete(messageId);
  }

}