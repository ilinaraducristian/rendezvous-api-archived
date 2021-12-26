import { BadRequestException as BRE } from "@nestjs/common/exceptions/bad-request.exception";

class BadRequestException extends Error {

  toHttpException(): BRE {
    return new BRE(this.message);
  }

}

class AlreadyMemberException extends BadRequestException {

  constructor() {
    super("you are already a member of this server");
  }

}

class BadChannelTypeException extends BadRequestException {

  constructor() {
    super("bad channel type");
  }

}

class BadOrExpiredInvitationException extends BadRequestException {

  constructor() {
    super("invitation is invalid or expired");
  }

}

class NotAMemberException extends BadRequestException {

  constructor() {
    super("you are not a member of this server");
  }

}

class AlreadyFriendsException extends BadRequestException {

  constructor() {
    super("you are already friends with this user");
  }

}

class FriendshipCannotBeUpdatedException extends BadRequestException {

  constructor() {
    super("the friendship cannot be updated");
  }

}

class BadFriendshipStatusException extends BadRequestException {

  constructor() {
    super("invalid status provided");
  }

}

class DefaultGroupCannotBeDeletedException extends BadRequestException {

  constructor() {
    super("the server's default group cannot be deleted");
  }

}

export default BadRequestException;

export {
  AlreadyMemberException,
  BadChannelTypeException,
  BadOrExpiredInvitationException,
  NotAMemberException,
  AlreadyFriendsException,
  FriendshipCannotBeUpdatedException,
  BadFriendshipStatusException,
  DefaultGroupCannotBeDeletedException
};