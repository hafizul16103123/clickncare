import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { RegionModel } from './entities/region.entity';
import { ProductRegionMicroServiceController } from './microservice/region-controller';

@Module({
  imports: [TypegooseModule.forFeature([RegionModel])],
  controllers: [RegionController, ProductRegionMicroServiceController],
  providers: [RegionService],
})
export class RegionModule {}
