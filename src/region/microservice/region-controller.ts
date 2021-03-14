import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegionService } from '../region.service';
@Controller()
export class ProductRegionMicroServiceController {
  constructor(private readonly regionService: RegionService) {}

  @MessagePattern({ cmd: 'PUBLIC_FIND_ALL_REGION' })
  async findAllRegion(): Promise<any> {
    return await this.regionService.findAllRegion();
  }

  @MessagePattern({ cmd: 'PUBLIC_FIND_ALL_CITY_BY_REGION' })
  async findAllCityByRegion(region: string): Promise<any> {
    return await this.regionService.findAllCityByRegion(region);
  }

  @MessagePattern({ cmd: 'PUBLIC_ALL_AREA_BY_CITY' })
  async findAllAreaByCity({ region, city }): Promise<any> {
    return await this.regionService.findAllAreaByCity(region, city);
  }
}
