type Message = {
  id: number,
  friendshipId: number | null,
  serverId: number | null,
  channelId: number | null,
  userId: string,
  timestamp: string,
  text: string,
  isReply: boolean,
  replyId: number | null,
  imageMd5: string | null,
}

export default Message;