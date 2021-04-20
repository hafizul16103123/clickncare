import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ChangeDeliveryLocatiob } from '../dto/delivery/delivery_location.dto';
import { Product } from '../entities/product.entity';
import { CategoryProductService } from '../services/category-product.service';
import { DeliveryLocationService } from '../services/delivery/delivery_location.service';
import { ProductService } from '../services/product.service';
import { SearchProductService } from '../services/search/search-product.service';

@Controller()
export class SearchMicroServiceController {
  constructor(private readonly searchProductService: SearchProductService) {}

  @MessagePattern({ cmd: 'PUBLIC_PRODUCT_SEARCH_SUGGESSTION' })
  async getSellerInfo(text: string): Promise<any> {
    return await this.searchProductService.getSuggesion(text);
  }
}
