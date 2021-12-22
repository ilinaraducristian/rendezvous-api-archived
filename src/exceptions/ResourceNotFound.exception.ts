import { NotFoundException } from "@nestjs/common";

abstract class ResourceNotFoundException extends Error {

  protected resource: string;

  protected constructor(resource: string) {
    super(`${resource} not found`);
    this.resource = resource;
  }

  abstract toHttpException(params: { [key: string]: string }): NotFoundException;

}

export default ResourceNotFoundException;