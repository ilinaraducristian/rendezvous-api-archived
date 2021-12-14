import ResourceNotFoundException from "./ResourceNotFound.exception";

class GroupNotFoundException extends ResourceNotFoundException {
  constructor() {
    super("group");
  }
}

export default GroupNotFoundException;