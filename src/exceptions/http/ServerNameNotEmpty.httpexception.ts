import ResourceNotEmptyHttpException from "./ResourceNotEmpty.httpexception";

class ServerNameNotEmptyHttpException extends ResourceNotEmptyHttpException {

  constructor() {
    super("server name");
  }

}

export default ServerNameNotEmptyHttpException;
