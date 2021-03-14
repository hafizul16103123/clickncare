import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ChangeDeliveryLocatiob,
  DeliveryLocationDto,
} from 'src/product/dto/delivery/delivery_location.dto';
import { DeliveryLocationService } from 'src/product/services/delivery/delivery_location.service';

@ApiTags('Delivery Location Related API')
@Controller('delivery')
export class DeliveryLocationController {
  constructor(
    private readonly deliveryLocationService: DeliveryLocationService,
  ) {}

  //  no needed (kibria)
  @Post('createDeliveryLocation')
  async createDeliveryLocation(@Body() data: DeliveryLocationDto) {
    return await this.deliveryLocationService.createDeliveryLocation(data);
  }

  //  no needed (kibria)
  @Get('getDefaultDeliveryLocation')
  @ApiQuery({ name: 'id', example: '738', required: false })
  async getDefaultDeliveryLocation(@Query('id') id: string) {
    return await this.deliveryLocationService.getDefaultDeliveryLocation(id);
  }

  //  no needed (kibria)
  @Get('getDeliveryLocation')
  async getDeliveryLocation() {
    return await this.deliveryLocationService.getDeliveryLocation();
  }

  @Post('change')
  async changeDeliveryLocation(@Body() data: ChangeDeliveryLocatiob) {
    return await this.deliveryLocationService.changeDeliveryLocation(data);
  }
}
