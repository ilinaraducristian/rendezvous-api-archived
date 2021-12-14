import ResourceNotFoundException from "./ResourceNotFound.exception";

class ChannelNotFoundException extends ResourceNotFoundException {
  constructor() {
    super("channel");
  }
}

export default ChannelNotFoundException;