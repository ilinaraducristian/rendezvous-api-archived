class ResourceNotEmptyException extends Error {
  constructor(resource: string) {
    super(`${resource} must not be empty`);
  }
}

export default ResourceNotEmptyException;