import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import cors from '@fastify/cors';
import { AppModule } from './app.module';
import {
  SWAGGER_PATH,
  buildSwaggerConfig,
} from './presentation/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const rawCorsOrigin = process.env.CORS_ORIGIN || '*';
  const corsOrigin =
    rawCorsOrigin.trim() === '*'
      ? true
      : rawCorsOrigin
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);

  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application running on http://localhost:${port}`);
  console.log(
    `Swagger documentation: http://localhost:${port}/${SWAGGER_PATH}`,
  );
}

void bootstrap();
