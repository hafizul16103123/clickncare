import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

import config from './configuration';
import { AllExceptionsFilter } from './utils/response/exception';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Startup', true);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: config.redisURL,
      connect_timeout: 1000,
    },
  });

  await app.startAllMicroservicesAsync();
  logger.log('Connected to Redis');

  const options = new DocumentBuilder()
    .setTitle('zDrop - Seller')
    .setDescription('API documentation for zDrop - Seller Service')
    .setVersion('1.0')
    .addBearerAuth({ name: 'token', type: 'http', scheme: 'bearer' })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter());

  logger.log('Mapped Swagger Docs');

  app.enableCors();
  await app.listen(config.port, '0.0.0.0', (err) => {
    if (err) {
      logger.error(err.message, err.stack, '[Fastify Startup Error]');
      process.exit(0);
    }
    logger.log(`APP Started on Port ${config.port}`);
  });
}

bootstrap();
