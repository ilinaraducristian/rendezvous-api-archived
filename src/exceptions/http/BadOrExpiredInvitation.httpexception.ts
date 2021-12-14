import { BadRequestException } from "@nestjs/common";

class BadOrExpiredInvitationHttpException extends BadRequestException {

  constructor() {
    super("invitation is invalid or expired");
  }

}

export default BadOrExpiredInvitationHttpException;