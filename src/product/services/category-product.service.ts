import { Injectable } from '@nestjs/common';
import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { paginate } from 'src/utils/paginate';
import config from '../../configuration';
import { Product } from '../entities/product.entity';
import { SellerColor } from '../entities/color.entity';
import { SellerSize } from '../entities/size.entity';
import { SellerCountry } from '../entities/country.entity';
import { SellerBrand } from '../entities/brand.entity';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/category.service';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { Schema } from 'mongoose';
import { Attribute_Filter } from '../entities/attribute_filter.entity';

@Injectable()
export class CategoryProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
    @InjectModel(SellerColor)
    private readonly colorModel: ReturnModelType<typeof SellerColor>,

    @InjectModel(SellerBrand)
    private readonly brandModel: ReturnModelType<typeof SellerBrand>,

    @InjectModel(SellerSize)
    private readonly sizeModel: ReturnModelType<typeof SellerSize>,

    @InjectModel(SellerCountry)
    private readonly countryModel: ReturnModelType<typeof SellerCountry>,

    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,

    @InjectModel(Attribute_Filter) 
    private readonly categoryLeftFilter: ReturnModelType<typeof Attribute_Filter>,

    private readonly categoryService: CategoryService,
  ) {}

  private paginate = paginate;

  async productsByCategory(
    id,
    color,
    size,
    minPrice,
    maxPrice,
    pageNum,
  ): Promise<any> {
    const query: unknown = {};
    if (id !== null) {
      query['categoryId'] = id;
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

    const product = await this.paginate<Product>(
      this.productModel
        .find(query)
        .limit(config.pageLimit)
        .populate('categoryId')
        .skip((pageNum - 1) * config.pageLimit),
      pageNum,
    );
    console.log({ product });
    const finalProduct = (await product).data.map((e, index) => {
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

    let colorValue = (await this.colorModel.find({})).map((e) => {
      return e.color;
    });
    let sizeValue = (await this.sizeModel.find({})).map((e) => {
      return e.size;
    });
    let countryValue = (await this.countryModel.find({})).map((e) => {
      return e.country;
    });
    let brandValue = (await this.brandModel.find({})).map((e) => {
      return e.brandName;
    });

    colorValue = [...new Set(colorValue)];
    sizeValue = [...new Set(sizeValue)];
    countryValue = [...new Set(countryValue)];
    brandValue = [...new Set(brandValue)];

    const cottonValue = ['cotton silk', 'cotton Blend'];
    const petterValue = ['Color Block', 'Checked'];
    const discount = ['10% - 30%', '20% - 25%'];
    const service = ['Cash On Delivery', 'Free Shipping'];

    const filters = {
      color: colorValue,
      size: sizeValue,
      country: countryValue,
      brand: brandValue,
      fabric: cottonValue,
      pattern: petterValue,
      clothing_style: [],
      mens_trend: [],
      fit_type: [],
      discount,
      service,
    };

    const category = await this.categoryModel.findOne({ categoryId: 1 }).lean();

    // return category;

    const meta = {
      title: category.categoryName,
      banner: {
        image:
          'https://firebasestorage.googleapis.com/v0/b/zdrop-7d8d4.appspot.com/o/Category%2Fbanner%2Flarge%2FGroup%206431.png?alt=media&token=9ed2da12-1d7f-4979-8394-3d22631f49e7',
        alt: category.categoryName,
      },
    };
    console.log({ meta });
    // console.log((product.item = []));
    delete product.data;

    return {
      meta,
      filters,
      ...product,
      items: finalProduct,
      totalCount: (await product).totalCount,
      currentPage: pageNum,
      totalPages: (await product).totalPages,
      nextPage: (await product).nextPage,
      showingFrom: 1,
      showingTo: 20,
    };
  }

  private getNextPage(data: boolean, total: number, pageNum: number): number {
    if (data) return null;
    return Math.ceil(total / config.pageLimit) === pageNum ? null : pageNum + 1;
  }

  async getCategoryLeftFilter(categoryId: number, data: any): Promise<any> {
		//console.log(data.data[0]);
		const getCategoryLeftFilter = await this.categoryLeftFilter.find({ categoryId: categoryId });

		// console.log(getCategoryLeftFilter);
		// console.log(data.data);
		const filteredAttr = [];

		for (const item of getCategoryLeftFilter) {
			let matchCount = 0;
			let totalCount = Object.keys(data.data).length;
			for (const [userKey, userValue] of Object.entries<string>(data.data)) {
				if (item.data[userKey]) {
					if(item.data[userKey].toLowerCase().trim() === userValue.toLowerCase().trim()){
						matchCount++;
					}					
				}
			}
			if (matchCount === totalCount) {
				filteredAttr.push(item);
			}
		}

		//console.log(filteredAttr)

		const categoryAttr = [];
		let attrObj = {};
		for (const item of filteredAttr) {
			for (const [key, value] of Object.entries(item.data)) {
				const attr_low = key.replace(/_/g, ' ');
				const attr_cap = attr_low.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

				attrObj = {
					categoryId: item.categoryId,
					attributeName: key,
					attributeLabel: attr_cap,
					attributeValue: value
				}

				categoryAttr.push(attrObj);
			}
		}

		const results = [];

		for (const item of categoryAttr) {
			const resItem = results.findIndex(e => e.categoryId === item.categoryId && e.attributeName === item.attributeName);
			if (resItem !== -1) {
				results[resItem].attributeValue = Array.from(new Set([...results[resItem].attributeValue, item.attributeValue]));
			} else {
				results.push({ ...item, attributeValue: [item.attributeValue] })
			}
		}

		const f_res = results.map((e) => {
			const attr = e.attributeValue.map((m) => {
				return {
					title: m,
					value: m
				}
			})

			return {
				categoryId: e.categoryId,
				attributeName: e.attributeName,
				attributeLabel: e.attributeLabel,
				attributeValue: attr
			}
		})

		return f_res;
	}




  
}
