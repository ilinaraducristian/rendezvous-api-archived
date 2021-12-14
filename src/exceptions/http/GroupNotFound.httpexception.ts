import ResourceWithIdNotFoundHttpException from "./ResourceWithIdNotFound.httpexception";

class GroupNotFoundHttpException extends ResourceWithIdNotFoundHttpException {

  constructor(id: string) {
    super("group", id);
  }

}

export default GroupNotFoundHttpException;