import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { ChannelType } from 'src/models/channel.model';

@Injectable()
export class DatabaseService {

  constructor(private readonly connection: Connection) {
  }

  join_server(userId: string, invitation: string) {
    return this.connection.query('CALL join_server(?,?)', [userId, invitation]);
  }

  create_server(userId: string, name: string) {
    return this.connection.query('CALL create_server(?,?)', [
      userId,
      name,
    ]);
  }

  send_message(
    userId: string,
    channelId: number,
    message: string,
    isReply: boolean,
    replyId: number | null,
    imageMd5: string | null,
  ) {
    return this.connection.query('CALL send_message(?,?,?,?,?,?)', [
      userId,
      channelId,
      message,
      isReply,
      replyId,
      imageMd5,
    ]);
  }

  create_invitation(userId: string, serverId: number) {
    return this.connection.query('SELECT create_invitation(?,?)', [userId, serverId]);
  }

  create_group(userId: string, serverId: number, name: string) {
    return this.connection
      .query('SELECT create_group(?,?,?)', [userId, serverId, name]);
  }

  create_channel(
    userId: string,
    serverId: number,
    groupId: number | null,
    type: ChannelType,
    name: string,
  ) {
    return this.connection
      .query('SELECT create_channel(?,?,?,?,?)', [
        userId,
        serverId,
        groupId,
        type,
        name,
      ]);
  }

  get_user_data(userId: string) {
    return this.connection.query(
      'CALL get_user_data(?)',
      [userId],
    );
  }

  get_messages(
    userId: string,
    serverId: number,
    channelId: number,
    offset: number,
  ) {
    return this.connection.query('CALL get_messages(?,?,?,?)', [
      userId,
      serverId,
      channelId,
      offset,
    ]);
  }

}
