import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/response/response';
import config from './configuration';
import { AllExceptionsFilter } from './utils/response/exception';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Startup', true);

  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.REDIS,
  //   options: {
  //     url: config.redisURL,
  //     connect_timeout: 1000,
  //   },
  // });
  // await app.startAllMicroservicesAsync();
  
  logger.log('Connected to Redis');

  app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const options = new DocumentBuilder()
    .setTitle('zDrop - Product')
    .setDescription('API documentation for zDrop - Product')
    .setVersion('1.0')
    .addBearerAuth({ name: 'token', type: 'http', scheme: 'bearer' })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter());

  logger.log('Mapped Swagger Docs');

  app.enableCors();
  // await app.listen(config.port, '0.0.0.0', (err) => {
  //   if (err) {
  //     logger.error(err.message, err.stack, '[Fastify Startup Error]');
  //     process.exit(0);
  //   }
  //   logger.log(`APP Started on Port ${config.port}`);
  // });
  await app.listen(2000);
}

bootstrap();
