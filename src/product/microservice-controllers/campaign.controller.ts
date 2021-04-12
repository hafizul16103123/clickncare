import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Product } from '../entities/product.entity';
import { CampaignService } from '../services/campaign.service';

@Controller()
export class CampaignMicroServiceController {
  constructor(private readonly campaignService: CampaignService) {}

  @MessagePattern({ cmd: 'GET_PRODUCTS_BY_IDs' })
  async getByProductId(data): Promise<any> {
    return await this.campaignService.getProductsById(data);
  }
}
