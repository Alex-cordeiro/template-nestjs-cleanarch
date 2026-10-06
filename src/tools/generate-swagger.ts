import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { buildSwaggerConfig } from '../presentation/swagger/swagger.config';

const OUTPUT_PATH = 'swagger.json';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  writeFileSync(OUTPUT_PATH, JSON.stringify(document, null, 2));

  await app.close();
  console.log(`Swagger gerado em ${OUTPUT_PATH}`);
}

generate().catch((err) => {
  console.error('Falha ao gerar o swagger.json:', err);
  process.exit(1);
});
