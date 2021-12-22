import ResourceNotEmptyException from "./ResourceNotEmpty.exception";

class GroupNameNotEmptyException extends ResourceNotEmptyException {

  constructor() {
    super("group name");
  }

}

export default GroupNameNotEmptyException;