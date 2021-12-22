import BadRequestException from "./BadRequest.exception";

class BadOrExpiredInvitationException extends BadRequestException {

  constructor() {
    super("invitation is invalid or expired");
  }

}

export default BadOrExpiredInvitationException;