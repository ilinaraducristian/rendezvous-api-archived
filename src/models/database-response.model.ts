import { ResultSetHeader } from 'mysql2';
import Group from './group.model';
import Channel from './channel.model';
import Member from './member.model';
import Server from './server.model';
import Message from './message.model';
import Friendship from './friendship.model';

export type FunctionIntReturnType = [{ [key: string]: number }, ResultSetHeader];
export type FunctionStringReturnType = [{ [key: string]: string }, ResultSetHeader];

type temp = [
  Omit<Server, 'channels' | 'groups' | 'members'>[], Omit<Group, 'channels'>[], Channel[], Member[]
]

export type ProcedureUserDataResponseType = [
  ...temp, Friendship[], { id: number, user1Id: string, user2Id: string, status: string }[], ResultSetHeader
]

export type ProcedureServerResponseType = [
  ...temp, ResultSetHeader
]

export type ProcedureMessagesType = [Message[], ResultSetHeader];