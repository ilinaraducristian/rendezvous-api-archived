class BadOrExpiredInvitationException extends Error {

  constructor() {
    super("invitation is invalid or expired");
  }

}

export default BadOrExpiredInvitationException;