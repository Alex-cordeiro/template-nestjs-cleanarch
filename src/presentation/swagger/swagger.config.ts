import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Template NestJS Clean Architecture API')
    .setDescription('API base com Clean Architecture, Fastify e Prisma')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
