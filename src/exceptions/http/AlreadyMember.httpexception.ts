import { BadRequestException } from "@nestjs/common";

class AlreadyMemberHttpException extends BadRequestException {
  constructor() {
    super("you are already a member of this server");
  }
}

export default AlreadyMemberHttpException;