import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class ChannelNotFoundHttpException extends ResourceWithIdNotFoundHttpException {

  constructor(id: string) {
    super("channel", id);
  }

}

export default ChannelNotFoundHttpException;