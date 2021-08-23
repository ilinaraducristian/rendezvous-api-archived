import { Injectable } from '@nestjs/common';
import Message from 'src/models/message.model';
import { DatabaseService } from 'src/services/database/database.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { Repository } from 'typeorm';
import { ObjectStoreService } from 'src/services/object-store/object-store.service';

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
  ): Promise<Omit<Message, 'imageMd5'> & { image: string | null }> {
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
    const storedMessage = result[0][0];
    storedMessage.image = image;
    delete storedMessage.imageMd5;
    return storedMessage;
  }

  async getMessages(
    userId: string,
    serverId: number,
    channelId: number,
    offset: number,
  ): Promise<Omit<Message, 'imageMd5'> & { image: string | null }[]> {
    const result = await this.databaseService.get_messages(
      userId,
      serverId,
      channelId,
      offset,
    );
    const messages = result[0].map((message) => {
      message.image = message.imageMd5;
      delete message.imageMd5;
      return message;
    });
    const promises = [];
    messages.forEach(message => {
      if (message.image === null) return;
      promises.push(this.objectStoreService.getImage(message.image).then(data => {
        message.image = data;
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
