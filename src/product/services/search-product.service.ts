import { HttpException, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { IPaginatedData, paginate } from 'src/utils/paginate';
import config from '../../configuration';
import { Product } from '../entities/product.entity';

@Injectable()
export class SearchProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
  ) {}

  private paginate = paginate;

  // searching products by key, color, size, minPrice, maxPrice
  async search(
    key,
    color,
    size,
    minPrice,
    maxPrice,
    pageNum = 1,
  ): Promise<any> {
    const query: unknown = {};
    if (key !== null) {
      query['productName'] = { $regex: '.*' + key + '.*', $options: 'i' };
    }
    if (color !== undefined) {
      query['priceStock.color'] = {
        $regex: '.*' + color + '.*',
        $options: 'i',
      };
    }
    if (size !== undefined) {
      query['priceStock.size'] = parseInt(size);
    }
    if (minPrice !== undefined && maxPrice === undefined) {
      query['priceStock.price'] = { $gte: parseInt(minPrice) };
    } else if (maxPrice !== undefined && minPrice === undefined) {
      query['priceStock.price'] = { $lte: parseInt(maxPrice) };
    } else if (minPrice !== undefined && maxPrice !== undefined) {
      query['priceStock.price'] = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice),
      };
    }

    const doc = (
      await this.productModel
        .find(query)
        .skip((pageNum - 1) * config.pageLimit)
        .limit(config.pageLimit)
        .populate('categoryId')
        .exec()
    ).map((e) => e.toJSON());

    if (!doc) throw new HttpException('Products not found', 404);
    const total = await this.productModel.countDocuments(query).exec();
    return {
      nextPage: this.getNextPage(doc.length === 0, total, pageNum),
      totalPages: Math.ceil(total / config.pageLimit),
      totalCount: total,
      data: doc,
    };
  }

  // Recommended products
  async recommendedProducts(productID: number): Promise<any | null> {
    const productDoc = await this.productModel
      .findOne({ productID: productID })
      .exec();

    // const doc = (
    //   await this.productModel
    //     .find({ categoryId: productDoc.categoryId })
    //     .populate('categoryId')
    //     .limit(20)
    //     .exec()
    // ).map((e) => e.toJSON());

    const doc = (
      await this.productModel
        .find({ categoryId: productDoc.categoryId })
        .limit(20)
        .exec()
    ).map((e) => {
      e.toJSON();

      return {
        id: e.productID,
        name: e.productName,
        categoryID: e.categoryId['_id'],
        sold: 20,
        rating: '4.5',
        imageUrl: e.image[0],
        altText: e.productName,
        price: {
          regular: e.priceStock[0].price,
          sale: e.priceStock[0].price,
          discountAmount: 0,
          discountPercentage: 10,
        },
      };
    });

    if (!doc) throw new HttpException('Products not found', 404);
    return doc;
  }

  async productStatusCount(sellerID: string): Promise<any> {
    const statusList = ['live', 'pending', 'reject', 'stockout', 'inactive'];
    const data = Promise.all(
      statusList.map(async (e) => {
        const returnData = await this.productModel.countDocuments({
          status: e,
        });

        return {
          count: returnData,
          title: `${e}`
        };
      }),
    );

    return data;
  }

  // get products by globalSKU. This is coming from microservices
  async productsBySKU({ productID, globalSKU }): Promise<any> {
    const hasProduct = await this.productModel
      .findOne({ _id: productID, 'priceStock.globalSKU': globalSKU })
      .exec();

    return hasProduct;
  }

  // Getting products by sellerID
  async getProductsBySellerId(
    pageNum = 1,
    sellerID,
  ): Promise<IPaginatedData<Product[]>> {
    const data = await this.paginate<Product>(
      this.productModel.find({ sellerID: sellerID }),
      pageNum,
    );

    return data;
  }

  // async getProductsByStatus(id, status): Promise<any> {}
  private getNextPage(data: boolean, total: number, pageNum: number): number {
    if (data) return null;
    return Math.ceil(total / config.pageLimit) === pageNum ? null : pageNum + 1;
  }
}
