import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { ChannelType } from '../../models/channel.model';
import {
  FunctionIntReturnType,
  FunctionStringReturnType,
  ProcedureMessagesType,
  ProcedureUserDataResponseType,
} from '../../models/database-response.model';

@Injectable()
export class DatabaseService {

  constructor(private readonly connection: Connection) {
  }

  join_server(userId: string, invitation: string): Promise<ProcedureUserDataResponseType> {
    return this.connection.query('CALL join_server(?,?)', [userId, invitation]);
  }

  create_server(userId: string, name: string): Promise<ProcedureUserDataResponseType> {
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
  ): Promise<ProcedureMessagesType> {
    return this.connection.query('CALL send_message(?,?,?,?,?,?)', [
      userId,
      channelId,
      message,
      isReply,
      replyId,
      imageMd5,
    ]);
  }

  create_invitation(userId: string, serverId: number): Promise<FunctionStringReturnType> {
    return this.connection.query('SELECT create_invitation(?,?)', [userId, serverId]);
  }

  create_group(userId: string, serverId: number, name: string): Promise<FunctionIntReturnType> {
    return this.connection
      .query('SELECT create_group(?,?,?)', [userId, serverId, name]);
  }

  create_channel(
    userId: string,
    serverId: number,
    groupId: number | null,
    type: ChannelType,
    name: string,
  ): Promise<FunctionIntReturnType> {
    return this.connection
      .query('SELECT create_channel(?,?,?,?,?)', [
        userId,
        serverId,
        groupId,
        type,
        name,
      ]);
  }

  get_user_data(userId: string): Promise<ProcedureUserDataResponseType> {
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
  ): Promise<ProcedureMessagesType> {
    return this.connection.query('CALL get_messages(?,?,?,?)', [
      userId,
      serverId,
      channelId,
      offset,
    ]);
  }

  send_friend_request(userId: string, user2Id: string) {
    return this.connection.query('CALL send_friend_request(?,?)',
      [
        userId,
        user2Id,
      ]);
  }

}
