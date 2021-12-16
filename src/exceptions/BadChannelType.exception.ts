class BadChannelTypeException extends Error {
  constructor() {
    super("bad channel type");
  }
}

export default BadChannelTypeException;