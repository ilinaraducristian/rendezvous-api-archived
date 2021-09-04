type NewMessageResponse = {
  id: number,
  friendshipId: number | null,
  serverId: number | null,
  channelId: number | null,
  userId: string,
  timestamp: string,
  text: string,
  isReply: boolean,
  replyId: number | null,
  image: string | null,
}

type NewMessageRequest = Omit<NewMessageResponse, 'id' | 'serverId' | 'userId' | 'timestamp'>;

type GetMessagesRequest = {
  friendshipId: number | null,
  serverId: number | null,
  channelId: number | null,
  offset: number
}

type EditMessagesRequest = {
  serverId: number,
  channelId: number,
  messageId: number,
  text: string
}
type DeleteMessagesRequest = {
  serverId: number,
  channelId: number,
  messageId: number
}

export {
  NewMessageRequest,
  NewMessageResponse,
  GetMessagesRequest,
  EditMessagesRequest,
  DeleteMessagesRequest,
};
