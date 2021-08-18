import Member from './member.model';
import Group from './group.model';
import Channel from './channel.model';
import { UserEntity } from '../entities/user.entity';
import User from './user.model';
declare type Server = {
    id: number;
    name: string;
    userId: string;
    invitation: string | null;
    invitationExp: string | null;
    channels: Channel[];
    groups: Group[];
    members: Member[];
};
export declare type UserServersData = {
    servers: Server[];
    users: User[];
};
export declare type UserServersDataQueryResult = [
    Omit<Server, 'channels' | 'groups' | 'members'>[],
    Omit<Group, 'channels'>[],
    Channel[],
    Member[],
    UserEntity[]
];
export declare type NewServer = {
    id: number;
    group1_id: number;
    group2_id: number;
    channel1_id: number;
    channel2_id: number;
    member_id: number;
};
export default Server;
