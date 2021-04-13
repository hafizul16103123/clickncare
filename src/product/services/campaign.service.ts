import { HttpException, Inject, Injectable } from '@nestjs/common';
import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { IPaginatedData, paginate } from 'src/utils/paginate';
import { Product } from '../entities/product.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
    @Inject('MICRO_SERVICE') private readonly redis: ClientProxy,
  ) {}

  // private paginate = paginate;

  async getProductsById(data): Promise<any> {
    let products = [];

    let i = 0;
    for (const item of data.ids) {
      if (i == data.limit) break;

      const product = await this.productModel.findOne({ productID: item });
      if (product) {
        products.push({
          id: product.productID,
          name: product.productName,
          categoryID: product.categoryId,
          sold: 20,
          rating: '4.5',
          imageUrl: product.image[0],
          altText: product.productName,
          price: {
            regular: product.priceStock[0].price,
            sale: product.priceStock[0].price,
            discountAmount: 0,
            discountPercentage: 10,
          },
        });
      }
      i++;
    }

    return products;
  }
}
