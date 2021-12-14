import ResourceNotEmptyHttpException from "./ResourceNotEmpty.httpexception";

class ChannelNameNotEmptyHttpException extends ResourceNotEmptyHttpException {

  constructor() {
    super("channel name");
  }

}

export default ChannelNameNotEmptyHttpException;
