import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus() || 500;

    let message: string = 'Internal server error';
    let error: unknown = undefined;

    const response = exception.getResponse();
    if (typeof response === 'string') {
      message = response;
    } else if (response && typeof response === 'object') {
      const respObj = response as Record<string, unknown>;
      if (typeof respObj.message === 'string') {
        message = respObj.message;
      } else if (Array.isArray(respObj.message)) {
        message = respObj.message.join(', ');
      }
      if (respObj.error !== undefined) {
        error = respObj.error;
      }
    } else if (exception?.message) {
      message = exception.message;
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: error ?? undefined,
      path: req.url,
    });
  }
}
