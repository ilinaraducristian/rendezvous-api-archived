class AlreadyMemberException extends Error {
  constructor() {
    super("you are already a member of this server");
  }
}

export default AlreadyMemberException;