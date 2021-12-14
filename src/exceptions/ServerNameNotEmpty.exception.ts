import ResourceNotEmptyException from "./ResourceNotEmpty.exception";

class ServerNameNotEmptyException extends ResourceNotEmptyException {
  constructor() {
    super("server name");
  }
}

export default ServerNameNotEmptyException;