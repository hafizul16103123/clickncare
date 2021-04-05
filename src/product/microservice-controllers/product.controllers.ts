import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ChangeDeliveryLocatiob } from '../dto/delivery/delivery_location.dto';
import { Product } from '../entities/product.entity';
import { CategoryProductService } from '../services/category-product.service';
import { DeliveryLocationService } from '../services/delivery/delivery_location.service';
import { ProductService } from '../services/product.service';
import { SearchProductService } from '../services/search-product.service';

@Controller()
export class ProductInfoMicroServiceController {
  constructor(
    private readonly searchProductService: SearchProductService,
    private readonly productService: ProductService,
    private readonly productCategoryService: CategoryProductService,
    private readonly deliveryLocationService: DeliveryLocationService,
  ) {}

  @MessagePattern({ cmd: 'PUBLIC_PRODUCT_SINGLE_INFO' })
  async getSellerInfo(id: number): Promise<Product> {
    return await this.productService.getSingleProduct(id);
  }

  @MessagePattern({ cmd: 'PUBLIC_PRODUCT_SINGLE_INFO_BY_PRODUCT_ID' })
  async getByProductId(id): Promise<any> {
    return await this.productService.getProductById(id);
  }

  @MessagePattern({ cmd: 'PUBLIC_SINGLE_PRODUCT_INFO' })
  async getSingleProduct(id): Promise<any> {
    return await this.productService.single(id);
  }

  // category base product
  @MessagePattern({ cmd: 'PUBLIC_PRODUCTS_BY_CATEGORY' })
  async getproductsByCategory({
    id,
    color,
    size,
    minPrice,
    maxPrice,
    pageNum = 1,
    searchKey,
    sortBy,
  }): Promise<any> {
    return await this.productCategoryService.productsByCategory(
      id,
      color,
      size,
      minPrice,
      maxPrice,
      pageNum,
      searchKey,
      sortBy,
    );
  }

  @MessagePattern({ cmd: 'PUBLIC_CATEGORY_PRODUCT_FILTER' })
  async getCategoryProductFilter(id): Promise<any> {
    return await this.productCategoryService.getCategoryProductFilter(id);
  }

  @MessagePattern({ cmd: 'PUBLIC_RECOMMENDED_PRODUCTS' })
  async recommendedProducts(productID: number): Promise<Product[] | null> {
    return await this.searchProductService.recommendedProducts(productID);
  }

  @MessagePattern({ cmd: 'PUBLIC_SEARCH_PRODUCTS' })
  async searchProducts(
    key: string,
    color: string,
    size: string,
    minPrice: string,
    maxPrice: string,
  ): Promise<Product[] | null> {
    return await this.searchProductService.search(
      key,
      color,
      size,
      minPrice,
      maxPrice,
    );
  }

  @MessagePattern({ cmd: 'PUBLIC_SEARCH_PRODUCT_FILTER' })
  async getSearchProductFilter(text): Promise<any> {
    return await this.searchProductService.getSearchProductFilter(text);
  }

  @MessagePattern({ cmd: 'PRODUCT_BY_PRODUCTID_GLOBALSKU' })
  async getProductBySKU({ productID, globalSKU }): Promise<any> {
    return await this.productService.productsBySKU({ productID, globalSKU });
  }

  @MessagePattern({ cmd: 'PRICESTOCK_BY_PRODUCTID_GLOBALSKU' })
  async getAttributeBySKU({ productID, globalSKU }): Promise<any> {
    return await this.productService.getAttributeBySKU({
      productID,
      globalSKU,
    });
  }

  // public profile seller product
  @MessagePattern({ cmd: 'GET_STORE_HOMEPAGE' })
  async getStoreHomepage({
    sellerID,
    page,
    minPrice,
    maxPrice,
    searchKey,
    sortBy,
  }): Promise<any> {
    return await this.productService.getStoreHomepage({
      sellerID,
      page,
      minPrice,
      maxPrice,
      searchKey,
      sortBy,
    });
  }

  @MessagePattern({ cmd: 'PUBLIC_SELLER_PRODUCT_BY_SELLER_ID' })
  async getSellerProfileProductBySellerID({
    pageNum,
    sellerID,
    minPrice,
    maxPrice,
    searchKey,
    sortBy,
  }): Promise<any> {
    return await this.productService.getSellerProfileProductBySellerID({
      pageNum,
      sellerID,
      minPrice,
      maxPrice,
      searchKey,
      sortBy,
    });
  }

  // category base seller product
  @MessagePattern({ cmd: 'PUBLIC_PRODUCT_BY_SELLER_ID' })
  async getSellerProductBySellerID(sellerID: string): Promise<any> {
    return await this.productService.getSellerProductBySellerID(sellerID);
  }

  // get product bt object id
  @MessagePattern({ cmd: 'PUBLIC_GET_PRODUCT_BY_OBJECT_ID' })
  async getProductByObjectID(objectID: string): Promise<any> {
    return await this.productService.getProductByObjectID(objectID);
  }

  // get product bt object id
  @MessagePattern({ cmd: 'PUBLIC_GET_DELIVERY_CHARGE' })
  async getDeliveryCharge(data: ChangeDeliveryLocatiob): Promise<any> {
    return await this.deliveryLocationService.changeDeliveryLocation(data);
  }

  // get attribute by GlobalSKU
  @MessagePattern({ cmd: 'PUBLIC_GET_ATTRIBUTE_BY_GLOBALSKU' })
  async getAttributeInfo({ globalSKU, productID }): Promise<any> {
    console.log(globalSKU, productID);
    return await this.productService.getVarientBySKU(globalSKU, productID);
  }
}
