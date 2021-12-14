import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request } from "express";
import ResourceNotEmptyException from "./exceptions/ResourceNotEmpty.exception";
import ResourceNotFoundException from "./exceptions/ResourceNotFound.exception";
import ServerNotFoundException from "./exceptions/ServerNotFound.exception";
import ServerNotFoundHttpException from "./exceptions/http/ServerNotFound.httpexception";
import ChannelNotFoundHttpException from "./exceptions/http/ChannelNotFound.httpexception";
import ChannelNotFoundException from "./exceptions/ChannelNotFound.exception";
import GroupNotFoundException from "./exceptions/GroupNotFound.exception";
import GroupNotFoundHttpException from "./exceptions/http/GroupNotFound.httpexception";
import MessageNotFoundException from "./exceptions/MessageNotFound.exception";
import MessageNotFoundHttpException from "./exceptions/http/MessageNotFound.httpexception";
import ServerNameNotEmptyException from "./exceptions/ServerNameNotEmpty.exception";
import ServerNameNotEmptyHttpException from "./exceptions/http/ServerNameNotEmpty.httpexception";
import GroupNameNotEmptyException from "./exceptions/GroupNameNotEmpty.exception";
import GroupNameNotEmptyHttpException from "./exceptions/http/GroupNameNotEmpty.httpexception";
import ChannelNameNotEmptyException from "./exceptions/ChannelNameNotEmpty.exception";
import ChannelNameNotEmptyHttpException from "./exceptions/http/ChannelNameNotEmpty.httpexception";
import MessageNotEmptyException from "./exceptions/MessageNotEmpty.exception";
import MessageNotEmptyHttpException from "./exceptions/http/MessageNotEmpty.httpexception";
import BadOrExpiredInvitationException from "./exceptions/BadOrExpiredInvitation.exception";
import BadOrExpiredInvitationHttpException from "./exceptions/http/BadOrExpiredInvitation.httpexception";
import AlreadyMemberException from "./exceptions/AlreadyMember.exception";
import AlreadyMemberHttpException from "./exceptions/http/AlreadyMember.httpexception";
import NotAMemberException from "./exceptions/NotAMember.exception";
import NotAMemberHttpException from "./exceptions/http/NotAMember.httpexception";

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch(error: Error, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    if (error instanceof ResourceNotFoundException) {
      if (error instanceof ServerNotFoundException)
        throw new ServerNotFoundHttpException(request.params.serverId);
      if (error instanceof GroupNotFoundException)
        throw new GroupNotFoundHttpException(request.params.groupId);
      if (error instanceof ChannelNotFoundException)
        throw new ChannelNotFoundHttpException(request.params.channelId);
      if (error instanceof MessageNotFoundException)
        throw new MessageNotFoundHttpException(request.params.messageId);
      throw error;
    } else if (error instanceof ResourceNotEmptyException) {
      if (error instanceof ServerNameNotEmptyException)
        throw new ServerNameNotEmptyHttpException();
      if (error instanceof GroupNameNotEmptyException)
        throw new GroupNameNotEmptyHttpException();
      if (error instanceof ChannelNameNotEmptyException)
        throw new ChannelNameNotEmptyHttpException();
      if (error instanceof MessageNotEmptyException)
        throw new MessageNotEmptyHttpException();
      throw error;
    } else if (error instanceof BadOrExpiredInvitationException) {
      throw new BadOrExpiredInvitationHttpException();
    } else if (error instanceof AlreadyMemberException) {
      throw new AlreadyMemberHttpException();
    } else if (error instanceof NotAMemberException) {
      throw new NotAMemberHttpException();
    }
    throw error;
  }
}
