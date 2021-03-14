import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import {
  PriceStock,
  Product,
  ProductSpecification,
  ServiceDelivery,
} from './entities/product.entity';
import { TypegooseModule } from 'nestjs-typegoose';
import { Wishlist } from './entities/wishlist.entity';
import { Cart } from './entities/cart.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppService } from 'src/app.service';
import { ProductInfoMicroServiceController } from './microservice-controllers/product.controllers';
import { SellerCountry } from './entities/country.entity';
import { SellerSize } from './entities/size.entity';
import { SellerColor } from './entities/color.entity';
import { SellerBrand } from './entities/brand.entity';
import { SearchProductController } from './controllers/search-product.controller';
import { SearchProductService } from './services/search-product.service';
import { ProductCategoryController } from './controllers/category-product.controller';
import { CategoryProductService } from './services/category-product.service';
import configuration from 'src/configuration';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/category.service';
import { Attribute } from 'src/category/entities/attribute.entity';
import { DeliveryLocation } from './entities/delivery/delivery_location.entity';
import { ProductReview } from './entities/review/product_review.entity';
import { DeliveryLocationService } from './services/delivery/delivery_location.service';
import { DeliveryLocationController } from './controllers/delivery/delivery_location.controller';
import { ProductReviewController } from './controllers/review/product_review.controller';
import { ProductReviewService } from './services/review/product_review.service';
import { SellerProductMicroServiceController } from './microservice-controllers/sellerProduct.controller';
import { SellerProductService } from './services/seller/seller.product.service';

@Module({
  imports: [
    TypegooseModule.forFeature([
      Product,
      ProductSpecification,
      ServiceDelivery,
      PriceStock,
      Cart,
      Wishlist,
      SellerColor,
      SellerSize,
      SellerCountry,
      SellerBrand,
      Category,
      Attribute,
      DeliveryLocation,
      ProductReview,
    ]),
    ClientsModule.register([
      {
        name: 'MICRO_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: configuration.redisURL,
        },
      },
    ]),
  ],
  controllers: [
    ProductController,
    ProductInfoMicroServiceController,
    SearchProductController,
    ProductCategoryController,
    DeliveryLocationController,
    ProductReviewController,
    SellerProductMicroServiceController,
  ],
  providers: [
    ProductService,
    AppService,
    SearchProductService,
    CategoryProductService,
    CategoryService,
    DeliveryLocationService,
    ProductReviewService,
    SellerProductService,
  ],
})
export class ProductModule {}
