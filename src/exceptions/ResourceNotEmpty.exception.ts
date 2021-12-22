import BadRequestException from "./BadRequest.exception";

class ResourceNotEmptyException extends BadRequestException {

  constructor(resource: string) {
    super(`${resource} must not be empty`);
  }

}

export default ResourceNotEmptyException;