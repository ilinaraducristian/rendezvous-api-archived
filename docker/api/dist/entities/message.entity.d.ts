export declare class MessageEntity {
  id: number;
  server_id: number;
  channel_id: number;
  user_id: string;
  timestamp: string;
  text: string;
  is_reply: boolean;
  replyId: number | null;
}
