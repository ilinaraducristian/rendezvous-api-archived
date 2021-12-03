import ChannelType from "./channel-type";
import Message from "./message";
import Member from "./member";

type Channel = {
    id: string,
    name: string,
    serverId: string,
    groupId: string | null,
    type: ChannelType
}

export type TextChannel = Channel & {
    messages: Message[],
}

export type VoiceChannel = Channel & {
    members: Member[]
}

export default Channel;