/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:4200',
      'http://app.shoaib.using.bilalthepunjabi.com',
      'https://app.shoaib.using.bilalthepunjabi.com'
    ],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
