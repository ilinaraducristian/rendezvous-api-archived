import { UserServersData } from '../models/server.model';

type NewServerRequest = {
  name: string,
}

type NewServerResponse = UserServersData

type NewInvitationRequest = {
  serverId: number,
}

type JoinServerRequest = {
  invitation: string
}

type JoinServerResponse = UserServersData

export {
  NewServerRequest,
  NewServerResponse,
  NewInvitationRequest,
  JoinServerRequest,
  JoinServerResponse,
};
