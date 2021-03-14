/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception?.response?.message || exception.message;
    let responseObjArr: unknown[];

    if (typeof message === 'object') {
      responseObjArr = [...message];
    } else {
      responseObjArr = [message];
    }

    request.status(status).send({
      success: false,
      message: responseObjArr,
      data: null,
    });
  }
}
