import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class ServerNotFoundHttpException extends ResourceWithIdNotFoundHttpException {

  constructor(id: string) {
    super("server", id);
  }

}

export default ServerNotFoundHttpException;