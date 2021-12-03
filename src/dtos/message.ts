import Reaction from "./reaction";
import Attachment from "./attachment";
import ReplyMessage from "./reply-message";

type Message = {
    id: string,
    serverId: string | null,
    groupId: string | null,
    channelId: string | null,
    friendId: string | null,
    timestamp: string,
    text: string,
    userId: string,
    replyMessage: ReplyMessage | null,
    reactions: Reaction[],
    attachments: Attachment[]
}

export default Message;