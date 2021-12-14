class ResourceNotFoundException extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export default ResourceNotFoundException;