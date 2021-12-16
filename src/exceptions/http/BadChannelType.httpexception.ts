import { BadRequestException } from "@nestjs/common";

class BadChannelTypeHttpException extends BadRequestException {

  constructor() {
    super("bad channel type");
  }

}

export default BadChannelTypeHttpException;