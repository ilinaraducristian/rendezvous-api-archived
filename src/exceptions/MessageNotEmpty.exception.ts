import ResourceNotEmptyException from "./ResourceNotEmpty.exception";

class MessageNotEmptyException extends ResourceNotEmptyException {
  constructor() {
    super("message");
  }
}

export default MessageNotEmptyException;