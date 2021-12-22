import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request } from "express";
import ResourceNotFoundException from "./exceptions/ResourceNotFound.exception";
import BadRequestException from "./exceptions/BadRequest.exception";

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch(error: Error, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();

    if (error instanceof ResourceNotFoundException)
      throw error.toHttpException(request.params);

    if (error instanceof BadRequestException)
      throw error.toHttpException();

    throw error;
  }
}
