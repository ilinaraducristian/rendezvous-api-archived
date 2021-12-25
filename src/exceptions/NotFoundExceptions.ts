import { NotFoundException } from "@nestjs/common";

abstract class ResourceNotFoundException extends Error {

  protected resource: string;

  protected constructor(resource: string) {
    super(`${resource} not found`);
    this.resource = resource;
  }

  abstract toHttpException(params: { [key: string]: string }): NotFoundException;

}

class ResourceWithIdNotFoundHttpException extends NotFoundException {

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
  }

}

class ChannelNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("channel");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.channelId);
  }

}

class GroupNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("group");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.groupId);
  }

}

class MessageNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("message");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.messageId);
  }

}

class ServerNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("server");
  }

  toHttpException(params: { [key: string]: string }): ResourceWithIdNotFoundHttpException {
    return new ResourceWithIdNotFoundHttpException(this.resource, params.serverId);
  }

}

class FriendshipNotFoundException extends ResourceNotFoundException {

  constructor() {
    super("friendship");
  }

  toHttpException(): NotFoundException {
    return new NotFoundException(this.resource);
  }

}

export default ResourceNotFoundException;

export {
  ResourceWithIdNotFoundHttpException,
  ChannelNotFoundException,
  GroupNotFoundException,
  MessageNotFoundException,
  ServerNotFoundException,
  FriendshipNotFoundException
};