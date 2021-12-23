import ChannelType from "./channel-type";
import Message from "./message";
import Member from "./member";

type Channel = {
    id: string,
    serverId: string,
    groupId: string,
    name: string,
    order: number,
    type: ChannelType
}

export type TextChannel = Channel & {
    messages: Message[],
}

export type VoiceChannel = Channel & {
    members: Member[]
}

export default Channel;