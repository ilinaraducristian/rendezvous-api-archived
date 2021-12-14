import ResourceNotEmptyHttpException from "./ResourceNotEmpty.httpexception";

class GroupNameNotEmptyHttpException extends ResourceNotEmptyHttpException {

  constructor() {
    super("group name");
  }

}

export default GroupNameNotEmptyHttpException;
