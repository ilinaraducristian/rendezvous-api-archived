import ResourceNotFoundException from "./ResourceNotFound.exception";
import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class ChannelNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("channel");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.channelId);
  }

}

export default ChannelNotFoundException;