import Message from './message.model';

export declare enum ChannelType {
    Text = 'text',
    Voice = 'voice'
}

declare type Channel = {
    id: number;
    serverId: number;
    groupId: number;
    type: ChannelType;
    name: string;
    order: number;
};
export declare type VoiceChannel = Channel & {
    users: {
        socketId: string;
        userId: string;
    }[];
};
export declare type TextChannel = Channel & {
    messages: Message[];
};
export default Channel;
