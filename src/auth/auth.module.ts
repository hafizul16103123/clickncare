import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import config from '../configuration';

@Module({
  imports: [
    TypegooseModule.forFeature([]),
    ClientsModule.register([
      {
        name: 'MICRO_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: config.redisURL,
        },
      },
    ]),
  ],

  providers: [],
  controllers: [AuthController],
})
export class AuthModule {}
