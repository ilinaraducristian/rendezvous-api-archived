import ResourceNotEmptyHttpException from "./ResourceNotEmpty.httpexception";

class MessageNotEmptyHttpException extends ResourceNotEmptyHttpException {

  constructor() {
    super("message");
  }

}

export default MessageNotEmptyHttpException;
