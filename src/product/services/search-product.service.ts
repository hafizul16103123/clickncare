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

    const doc = await this.paginate<Product>(
      this.productModel
        .find(query)
        .skip((pageNum - 1) * config.pageLimit)
        .limit(config.pageLimit)
        .populate('categoryId'),
      pageNum,
    );

    const finalProduct = doc.data.map((e, index) => {
      return {
        id: e.productID,
        name: e.productName,
        categoryID: e.categoryId,
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
    const meta = {
      title: key,
      banner: {
        image:
          'https://firebasestorage.googleapis.com/v0/b/zdrop-7d8d4.appspot.com/o/Category%2Fbanner%2Flarge%2FGroup%206431.png?alt=media&token=9ed2da12-1d7f-4979-8394-3d22631f49e7',
        alt: key,
      },
    };

    if (!doc) throw new HttpException('Products not found', 404);

    return {
      meta,
      filters: [
        {
          options: [
            {
              value: 'smartphones',
              title: 'Mobiles',
              url: '/smartphones/realme-201624/?ppath=31000%3A200794',
              order: 0,
              id: '3',
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'category',
          type: 'category',
          unfoldRow: '-1',
          title: 'Related Categories',
          urlKey: 'category',
          value: 'smartphones',
          displayValue: 'Mobiles',
          hidden: false,
          locked: false,
        },
        {
          pid: '20000',
          options: [
            {
              value: 'realme-201624',
              title: 'Realme',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'brand',
          type: 'brand',
          unfoldRow: '-1',
          title: 'Brand',
          urlKey: 'ppath',
          value: ['realme-201624'],
          displayValue: ['Realme'],
          hidden: false,
          locked: false,
        },
        {
          options: [
            {
              value: 'INSTALLMENT',
              title: 'Installment',
              order: 3,
            },
            {
              value: 'COD',
              title: 'Cash On Delivery',
              order: 4,
            },
            {
              value: 'FBL',
              title: 'Fulfilled By Daraz',
              order: 5,
            },
            {
              value: 'OS',
              title: 'DarazMall',
              order: 7,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'service',
          type: 'multiple',
          unfoldRow: '2',
          title: 'Service',
          urlKey: 'service',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          options: [
            {
              value: '-21',
              title: 'Bangladesh',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'location',
          type: 'multiple',
          unfoldRow: '1',
          title: 'Location',
          urlKey: 'location',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          showMin: 'Min',
          showMax: 'Max',
          name: 'price',
          type: 'price',
          unfoldRow: '2',
          title: 'Price',
          urlKey: 'price',
          hidden: false,
          locked: false,
        },
        {
          name: 'rating',
          type: 'rating',
          unfoldRow: '2',
          title: 'Rating',
          urlKey: 'rating',
          value: '0',
          hidden: false,
          locked: false,
        },
        {
          pid: '30972',
          options: [
            {
              value: '30972:190173',
              title: 'Dual SIM',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Number of SIM',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '30858',
          options: [
            {
              value: '30858:196028',
              title: '6 Inch and Above',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Screen Size (inches)',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '30595',
          options: [
            {
              value: '30595:123358402',
              title: '5000 - 5999 mAh',
              order: 0,
            },
            {
              value: '30595:123358403',
              title: '6000 - 6999 mAh',
              order: 0,
            },
            {
              value: '30595:123358405',
              title: '8000 - 8999 mAh',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Battery Capacity (mAh)',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '30926',
          options: [
            {
              value: '30926:62917',
              title: '6 GB',
              order: 0,
            },
            {
              value: '30926:70028',
              title: '4 GB',
              order: 0,
            },
            {
              value: '30926:70029',
              title: '3 GB',
              order: 0,
            },
            {
              value: '30926:70031',
              title: '2 GB',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'RAM Memory',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '31003',
          options: [
            {
              value: '31003:3942',
              title: '128GB',
              order: 0,
            },
            {
              value: '31003:14345',
              title: '32GB',
              order: 0,
            },
            {
              value: '31003:14347',
              title: '64GB',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Storage Capacity',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '31000',
          options: [
            {
              value: '31000:200794',
              title: '11 - 15 MP',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '-1',
          title: 'Camera Back (Megapixels)',
          urlKey: 'ppath',
          value: ['31000:200794'],
          displayValue: ['11 - 15 MP'],
          hidden: false,
          locked: false,
        },
        {
          pid: '31084',
          options: [
            {
              value: '31084:3966',
              title: 'Android',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Operating System',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '7',
          options: [
            {
              value: '7:123719065',
              title: 'Seller Warranty',
              order: 0,
            },
            {
              value: '7:4492',
              title: 'Local seller warranty',
              order: 0,
            },
            {
              value: '7:192950',
              title: 'Brand Warranty',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Warranty Type',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '8',
          options: [
            {
              value: '8:4447',
              title: '1 Year',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Warranty Period',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
        {
          pid: '30990',
          options: [
            {
              value: '30990:23119',
              title: '8 MP',
              order: 0,
            },
            {
              value: '30990:195749',
              title: '5 MP',
              order: 0,
            },
          ],
          isPreposed: false,
          preposeOrder: 0,
          name: 'attribute',
          type: 'multiple',
          unfoldRow: '0',
          title: 'Camera Front (Megapixels)',
          urlKey: 'ppath',
          value: [],
          hidden: false,
          locked: false,
        },
      ],
      items: finalProduct,
      totalCount: doc.totalCount,
      currentPage: pageNum,
      totalPages: doc.totalPages,
      nextPage: doc.nextPage,
      showingFrom: doc.from,
      showingTo: doc.to,
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
          [`${e}`]: returnData,
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
