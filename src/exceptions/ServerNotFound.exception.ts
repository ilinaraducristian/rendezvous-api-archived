import ResourceNotFoundException from "./ResourceNotFound.exception";

class ServerNotFoundException extends ResourceNotFoundException {
  constructor() {
    super("server");
  }
}

export default ServerNotFoundException;