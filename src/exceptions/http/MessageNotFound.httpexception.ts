import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class MessageNotFoundHttpException extends ResourceWithIdNotFoundHttpException {

  constructor(id: string) {
    super("message", id);
  }

}

export default MessageNotFoundHttpException;