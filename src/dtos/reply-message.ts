import Message from "./message";

type ReplyMessage = Pick<Message, "id" | "text"> & {
    hasAttachments: boolean
}

export default ReplyMessage;