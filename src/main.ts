import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NextFunction, Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // TODO: Global Prefix add all API routes
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  // TODO: Global Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // TODO: Global Exception Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // TODO: Root API Redirect to Swagger
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/') {
      return res.redirect('api');
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME || 'Blog App')
    .setDescription('The blogs API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
