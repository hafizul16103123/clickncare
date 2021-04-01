import { HttpException, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import config from '../../../configuration';
import { paginate } from 'src/utils/paginate';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class SellerProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
  ) {}

  private paginate = paginate;

  async getSellerProduct(sellerID: string, pageNum: number, status: string) {
    let query;
    if (status == 'all') {
      query = { sellerID: sellerID };
    } else {
      query = { sellerID: sellerID, status: status };
    }

    const product = await this.paginate<Product>(
      this.productModel
        .find(query)
        .limit(config.pageLimit)
        .skip((pageNum - 1) * config.pageLimit),
      pageNum,
    );

    const finalProduct = product.data.map((e, index) => {
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

    return {
      ...product,
      items: finalProduct,
      totalCount: product.totalCount,
      currentPage: pageNum,
      totalPages: product.totalPages,
      nextPage: product.nextPage,
      showingFrom: product.from,
      showingTo: product.to,
    };
  }

  async sellerProductDeactive(
    sellerID: string,
    productID: number,
  ): Promise<any> {
    console.log(sellerID, productID);

    const product = await this.productModel.findOne({
      productID: productID,
      sellerID: sellerID,
    });

    if (product != null) {
      product.status = 'deactivated';
      product.save();
      return 'success';
    } else {
      return 'false';
    }
  }

  async sellerProductSearch(sellerID: string, text: string, pageNum: number, productId: number, sellerSKU: string) {
    //console.log(sellerID, text, pageNum);

    const product = await this.paginate<Product>(
      this.productModel
        .find({$or:[ {'sellerID':sellerID}, {'productName':text}, {'productID':productId}, {'sellerSKU':sellerSKU} ]}) 
        .limit(config.pageLimit)
        .populate('categoryId')
        .skip((pageNum - 1) * config.pageLimit),
      pageNum,
    );

    const finalProduct = product.data.map((e, index) => {
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

    const finaldata = {
      ...product,
      items: finalProduct,
      totalCount: product.totalCount,
      currentPage: pageNum,
      totalPages: product.totalPages,
      nextPage: product.nextPage,
      showingFrom: product.from,
      showingTo: product.to,
    };

    return finaldata;
  }

  async sellerProductCount(sellerID: string) {
    return await this.productModel.countDocuments({
      sellerID: sellerID,
    });
  }
}
