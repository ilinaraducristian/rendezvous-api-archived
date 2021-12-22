import BadRequestException from "./BadRequest.exception";

class AlreadyMemberException extends BadRequestException {

  constructor() {
    super("you are already a member of this server");
  }

}

export default AlreadyMemberException;