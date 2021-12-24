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

class ResourceNotEmptyException extends BadRequestException {

  constructor(resource: string) {
    super(`${resource} must not be empty`);
  }

}

export default BadRequestException;

export {
  AlreadyMemberException,
  BadChannelTypeException,
  BadOrExpiredInvitationException,
  NotAMemberException,
  ResourceNotEmptyException
};