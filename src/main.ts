import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all_exception_filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new HttpExceptionFilter());
  if (process.env.NODE_ENV === 'development') {
    app.useGlobalFilters(new AllExceptionsFilter());
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Don't allow extra fields that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if extra fields are present
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
