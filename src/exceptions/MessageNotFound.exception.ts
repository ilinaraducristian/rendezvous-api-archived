import ResourceNotFoundException from "./ResourceNotFound.exception";

class MessageNotFoundException extends ResourceNotFoundException {
  constructor() {
    super("message");
  }
}

export default MessageNotFoundException;