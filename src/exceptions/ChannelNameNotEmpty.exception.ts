import ResourceNotEmptyException from "./ResourceNotEmpty.exception";

class ChannelNameNotEmptyException extends ResourceNotEmptyException {
  constructor() {
    super("channel name");
  }
}

export default ChannelNameNotEmptyException;