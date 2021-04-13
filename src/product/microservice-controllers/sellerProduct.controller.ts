import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from 'nestjs-typegoose';
import { Product } from '../entities/product.entity';
import { SearchProductService } from '../services/search/search-product.service';
import { SellerProductService } from '../services/seller/seller.product.service';

@Controller()
export class SellerProductMicroServiceController {
  constructor(
    private readonly sellerProductService: SellerProductService,
    private readonly searchProductService: SearchProductService,
  ) {}

  @MessagePattern({ cmd: 'SELLER_PRODUCT' })
  async getSellerProduct({ sellerID, pageNum, status }): Promise<any> {
    return this.sellerProductService.getSellerProduct(
      sellerID,
      pageNum,
      status,
    );
  }

  @MessagePattern({ cmd: 'SELLER_PRODUCTS_COUNT' })
  async getProductsCount(sellerID: string): Promise<any> {
    return await this.searchProductService.productStatusCount(sellerID);
  }

  @MessagePattern({ cmd: 'SELLER_PRODUCT_DEACTIVE' })
  async sellerProductDeactive({ sellerID, productID }): Promise<any> {
    return await this.sellerProductService.sellerProductDeactive(
      sellerID,
      productID,
    );
  }

  @MessagePattern({ cmd: 'SELLER_PRODUCT_SEARCH' })
  async sellerProductSearch({
    sellerID,
    text,
    pageNum,
    productId,
    sellerSKU,
  }): Promise<any> {
    return await this.sellerProductService.sellerProductSearch(
      sellerID,
      text,
      pageNum,
      productId,
      sellerSKU,
    );
  }

  @MessagePattern({ cmd: 'SELLER_PRODUCT_COUNT' })
  async sellerProductCount(sellerID: string): Promise<any> {
    return await this.sellerProductService.sellerProductCount(sellerID);
  }
}
