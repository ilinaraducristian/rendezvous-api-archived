import { NotFoundException } from "@nestjs/common";

class ResourceWithIdNotFoundHttpException extends NotFoundException {

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
  }

}

export default ResourceWithIdNotFoundHttpException;