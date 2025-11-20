/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('exception', exception);

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';
    let error: any = undefined;

    // If the exception is HttpException (Nest built-in)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const respObj = response as Record<string, any>;
        if (Array.isArray(respObj.message)) {
          message = respObj.message.join(', ');
        } else {
          message = respObj.message || message;
        }
        error = respObj.error;
      }
    }

    // If MongoDB wrong ID CastError
    if ((exception as any)?.name === 'CastError') {
      status = 400;
      message = 'Invalid MongoDB ID format';
      error = 'Bad Request';
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      path: req.url,
    });
  }
}
