import Message from './message.model';

export enum ChannelType {
  Text = 'text',
  Voice = 'voice'
}

type Channel = {
  id: number,
  serverId: number,
  groupId: number,
  type: ChannelType,
  name: string,
  order: number,
}

export type VoiceChannel = Channel & {
  users: { socketId: string, userId: string }[],
}

export type TextChannel = Channel & {
  messages: Message[]
}

export default Channel;