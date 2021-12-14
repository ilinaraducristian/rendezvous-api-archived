import { BadRequestException } from "@nestjs/common";

class NotAMemberHttpException extends BadRequestException {
  constructor() {
    super("you are not a member of this server");
  }
}

export default NotAMemberHttpException;