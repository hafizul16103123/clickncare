import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegionService } from './region.service';
import { RegionModel, Name } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';

@ApiTags('Region')
@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async findAllRegion(): Promise<RegionModel[]> {
    const data = await this.regionService.findAllRegion();
    return data;
  }

  @Get('city/:region')
  async findAllCityByRegion(@Param('region') region: string): Promise<Name[]> {
    const data = await this.regionService.findAllCityByRegion(region);
    return data;
  }

  @Get('zone/:region/:city')
  async findAllAreaByCity(
    @Param('region') region: string,
    @Param('city') city: string,
  ): Promise<Name[]> {
    const data = await this.regionService.findAllAreaByCity(region, city);
    return data;
  }

  @Get(':name')
  async findAllByRegion(@Param('name') name: string): Promise<RegionModel> {
    const data = await this.regionService.findAllByRegion(name);
    return data;
  }

  @Post()
  async post(@Body() dat: CreateRegionDto): Promise<any> {
    const data = await this.regionService.post(dat);
    return data;
  }
}
