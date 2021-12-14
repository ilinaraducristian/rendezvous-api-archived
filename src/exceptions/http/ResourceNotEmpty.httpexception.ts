import { BadRequestException } from "@nestjs/common";

class ResourceNotEmptyHttpException extends BadRequestException {

  constructor(resource: string) {
    super(`${resource} must not be empty`);
  }

}

export default ResourceNotEmptyHttpException;