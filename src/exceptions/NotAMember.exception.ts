class NotAMemberException extends Error {
  constructor() {
    super("you are not a member of this server");
  }
}

export default NotAMemberException;