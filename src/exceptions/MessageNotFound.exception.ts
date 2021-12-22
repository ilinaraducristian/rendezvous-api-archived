import ResourceNotFoundException from "./ResourceNotFound.exception";
import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class MessageNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("message");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.messageId);
  }

}

export default MessageNotFoundException;