import ResourceNotFoundException from "./ResourceNotFound.exception";
import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class ServerNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("server");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.serverId);
  }

}

export default ServerNotFoundException;