import BadRequestException from "./BadRequest.exception";

class NotAMemberException extends BadRequestException {

  constructor() {
    super("you are not a member of this server");
  }

}

export default NotAMemberException;