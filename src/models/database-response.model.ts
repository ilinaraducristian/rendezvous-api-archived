import { ResultSetHeader } from 'mysql2';
import Group from './group.model';
import Channel from './channel.model';
import Member from './member.model';
import { UserEntity } from '../entities/user.entity';
import Server from './server.model';
import Message from './message.model';

export type FunctionIntReturnType = [{ [key: string]: number }, ResultSetHeader];
export type FunctionStringReturnType = [{ [key: string]: string }, ResultSetHeader];

export type ProcedureUserDataResponseType = [
  Omit<Server, 'channels' | 'groups' | 'members'>[], Omit<Group, 'channels'>[], Channel[], Member[], UserEntity[], ResultSetHeader
]

export type ProcedureMessagesType = [Message[], ResultSetHeader]