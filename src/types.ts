export type KeycloakUser = {
  sub: string,
  preferred_username: string,
  email: string, name: string,
  nickname: string,
  given_name: string,
  family_name: string
}

export type User = {
  id: string,
  username: string,
  firstName: string,
  lastName: string
}

export type Group = {
  id: number,
  serverId: number,
  name: string,
  channels: Channel[] // channels in a group
}

export enum ChannelType {
  Text = "text",
  Voice = "voice"
}

export type VoiceChannel = Channel & {
  users: any[],
}

export type TextChannel = Channel &  {
  messages: Message[]
}

export type Channel = {
  id: number,
  serverId: number,
  groupId: number,
  type: ChannelType,
  name: string,
  order: number,
}

export type Message = {
  id: number,
  serverId: number,
  channelId: number,
  userId: string,
  timestamp: string,
  text: string,
}

export type Member = {
  id: number,
  serverId: number,
  userId: string,
}

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

export type UserServersData = {
  servers: Server[],
  users: User[]
}

export type UserServersDataQueryResult = [
  Omit<Server, 'channels' | 'groups' | 'members'>[], Omit<Group, "channels">[], Channel[], (Member & User)[]
]

export type NewServer = {
  id: number,
  group1_id: number,
  group2_id: number,
  channel1_id: number,
  channel2_id: number,
  member_id: number,
};