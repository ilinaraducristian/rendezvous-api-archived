import { ResultSetHeader } from 'mysql2';
import { Server } from '../dtos/server.dto';
import { Group } from '../dtos/group.dto';
import { Member } from '../dtos/member.dto';
import { Channel } from '../dtos/channel.dto';
import { Friendship } from '../dtos/friend.dto';
import { Message } from './message.model';


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