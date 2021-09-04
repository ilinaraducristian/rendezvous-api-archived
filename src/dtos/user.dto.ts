import { UserServersData } from '../models/server.model';

type UserDataResponse = UserServersData;

type AcceptFriendRequest = {
  friendRequestId: number
}

type SendFriendRequest = {
  username: string
}

type SendFriendRequestResponse = {
  id: number,
  userId: string
}

export {
  UserDataResponse,
  AcceptFriendRequest,
  SendFriendRequest,
  SendFriendRequestResponse,
};
