import BadRequestException from "./BadRequest.exception";

class BadChannelTypeException extends BadRequestException {

  constructor() {
    super("bad channel type");
  }

}

export default BadChannelTypeException;