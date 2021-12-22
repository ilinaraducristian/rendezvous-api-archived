import ResourceNotFoundException from "./ResourceNotFound.exception";
import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class GroupNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("group");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.groupId);
  }

}

export default GroupNotFoundException;