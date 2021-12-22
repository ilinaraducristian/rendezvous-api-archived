import { BadRequestException as BRE } from "@nestjs/common";

class BadRequestException extends Error {

  toHttpException(): BRE {
    return new BRE(this.message);
  }

}

export default BadRequestException;