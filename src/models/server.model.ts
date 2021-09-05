import Member from './member.model';
import Group from './group.model';
import Channel from './channel.model';
import User from './user.model';
import FriendRequest from './friend-request.model';
import Friendship from './friendship.model';

type Server = {
  id: number,
  name: string,
  userId: string,
  invitation: string | null,
  invitationExp: string | null,
  channels: Channel[], // channels without a group
  groups: Group[],
  members: Member[]
}

export type UserServersData = {
  servers: Server[],
  users: User[]
}

export type UserData = {
  servers: Server[],
  friendships: Friendship[],
  friendRequests: FriendRequest[],
  users: User[]
}

export type NewServer = {
  id: number,
  group1_id: number,
  group2_id: number,
  channel1_id: number,
  channel2_id: number,
  member_id: number,
};

export default Server;