import { NotFoundException } from "@nestjs/common";

class ResourceNotFoundException extends Error {

  toHttpException(): NotFoundException {
    return new NotFoundException(this.message);
  }

}

class ChannelNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("channel");
  }

}

class GroupNotFoundException extends ResourceNotFoundException {

  constructor(groupId?: string) {
    if (groupId === undefined)
      super("group");
    else
      super(`group with id: ${groupId}`);
  }

}

class MessageNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("message");
  }

}

class ServerNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("server");
  }

}

class FriendshipNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("friendship");
  }

}

export default ResourceNotFoundException;

export {
  ChannelNotFoundException,
  GroupNotFoundException,
  MessageNotFoundException,
  ServerNotFoundException,
  FriendshipNotFoundException
};