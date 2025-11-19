import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { GenericType, IApiResponse, IControllerData } from 'src/interfaces';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((reponseData: IControllerData): IApiResponse => {
        return {
          success: reponseData.success ?? true,
          statusCode: response.statusCode,
          message: reponseData?.message ?? 'Success',
          data: (reponseData.data?.data as GenericType<T>) || null,
          meta: reponseData.data?.meta ?? undefined,
        };
      }),
    );
  }
}
