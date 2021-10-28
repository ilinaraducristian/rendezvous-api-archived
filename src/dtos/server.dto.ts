import { Channel } from './channel.dto';
import { Group } from './group.dto';
import { Member } from './member.dto';
import { UserServersData } from './user.dto';
import { Role } from './role.dto';

export type Server = {
  id: number,
  name: string,
  userId: string,
  order: number,
  image: string | null,
  invitation: string | null,
  invitationExp: string | null,
  channels: Channel[], // channels without a group
  groups: Group[],
  members: Member[],
  roles: Role[],
}

export type NewServerRequest = {
  name: string,
}

export type NewServerResponse = UserServersData

export type NewInvitationRequest = {
  serverId: number,
}

export type NewInvitationResponse = {
  invitation: string
}

export type JoinServerRequest = {
  invitation: string
}

export type MoveServerRequest = {
  serverId: number,
  order: number
}

export type MoveServerResponse = {
  servers: { id: number, order: number }[]
}

export type UpdateServerImageRequest = {
  serverId: number,
  image: string | null
}

export type JoinServerResponse = UserServersData
