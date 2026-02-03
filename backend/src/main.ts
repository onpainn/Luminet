import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const adapter = app.getHttpAdapter();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = adapter.getInstance();
  instance.set('trust proxy', true);

  const configService = app.get(ConfigService);

  // cookies
  app.use(cookieParser());

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.getOrThrow<number>('APP_PORT');
  await app.listen(port);
}

bootstrap();
