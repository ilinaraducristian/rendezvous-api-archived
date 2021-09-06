import { Channel } from './channel.dto';
import { Group } from './group.dto';
import { Member } from './member.dto';
import { UserServersData } from './user.dto';

export type Server = {
  id: number,
  name: string,
  userId: string,
  invitation: string | null,
  invitationExp: string | null,
  channels: Channel[], // channels without a group
  groups: Group[],
  members: Member[]
}

export type NewServerRequest = {
  name: string,
}

export type NewServerResponse = UserServersData

export type NewInvitationRequest = {
  serverId: number,
}

export type JoinServerRequest = {
  invitation: string
}

export type JoinServerResponse = UserServersData
