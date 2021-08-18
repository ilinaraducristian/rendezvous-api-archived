import Channel from './channel.model';
declare type Group = {
    id: number;
    serverId: number;
    name: string;
    channels: Channel[];
};
export default Group;
