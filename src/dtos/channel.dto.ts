type JoinVoiceChannelRequest = {
  serverId: number,
  channelId: number,
}

type JoinVoiceChannelResponse = {
  channelId: number,
  socketId: string,
  userId: string
}[]

type NewChannelRequest = {
  serverId: number,
  groupId: number | null,
  channelName: string
}

type NewChannelResponse = {
  channelId: number
}

type MoveChannelRequest = {
  serverId: number,
  channelId: number,
  groupId: number | null,
  order: number
}

export {
  JoinVoiceChannelRequest,
  JoinVoiceChannelResponse,
  NewChannelRequest,
  NewChannelResponse,
  MoveChannelRequest,
};
