import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import config from './configuration';
import configuration from './configuration';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Category } from './category/entities/category.entity';
import { CategoryModule } from './category/category.module';
import { RegionModule } from './region/region.module';
import { imageUploadModule } from './imageUpload/imageUpload.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypegooseModule.forRoot(config.mongoURL, {
      useCreateIndex: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }),
    MulterModule.register({
      dest: './files',
    }),
    ProductModule,
    CategoryModule,
    RegionModule,
    imageUploadModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'MICRO_SERVICE',
      useValue: ClientProxyFactory.create({
        options: { url: config.redisURL },
        transport: Transport.REDIS,
      }),
    },
  ],
})
export class AppModule {}
