type Message = {
  id: number,
  serverId: number,
  channelId: number,
  userId: string,
  timestamp: string,
  text: string,
  isReply: boolean,
  replyId: number | null,
  imageMd5: string | null,
}

export type FrontendMessage = Omit<Message, 'imageMd5'> & { image: string | null };

export default Message;