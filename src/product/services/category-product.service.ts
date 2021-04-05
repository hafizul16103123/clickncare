import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
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
    private readonly categoryLeftFilter: ReturnModelType<
      typeof Attribute_Filter
    >,

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
    searchKey,
    sortBy,
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
        .limit(config.paginateViewLimit)
        .skip((pageNum - 1) * config.paginateViewLimit),
      pageNum,
    );

    const count = await this.productModel.countDocuments({ categoryId: id });

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

    const category = await this.categoryModel.findOne({ _id: id });
    // return category;

    const meta = {
      title: category.categoryName,
      banner: {
        image: '',
        alt: category.categoryName,
      },
    };
    // console.log((product.item = []));
    delete product.data;

    // subcategory
    const subcategory = await this.categoryModel
      .find({
        parentId: category.categoryId,
      })
      .select({
        _id: 0,
        image: 1,
        categoryName: 1,
        categoryId: 1,
      });

    return {
      subCategory: subcategory,
      meta,
      ...product,
      items: finalProduct,
      totalCount: count,
      currentPage: pageNum,
      totalPages: product.totalPages,
      nextPage: product.nextPage,
      showingFrom: product.from,
      showingTo: product.to,
    };
  }

  async getCategoryProductFilter(id) {
    return [
      {
        options: [
          {
            value: 'bags-travel',
            title: 'Bags and Travel',
          },
        ],
        title: 'Related Categories',
      },
      {
        options: [
          {
            value: 'greatwall',
            title: 'Greatwall',
            order: 0,
          },
          {
            value: 'dream-leather-world',
            title: 'Dream Leather World',
            order: 0,
          },
          {
            value: 'easy-live',
            title: 'EASY LIVE',
            order: 0,
          },
          {
            value: 'new-top-ten',
            title: 'New Top Ten',
            order: 0,
          },
          {
            value: 'lemon-14711',
            title: 'Lemon',
            order: 0,
          },
          {
            value: 'royal-bagger-123559412',
            title: 'Royal Bagger',
            order: 0,
          },
          {
            value: 'bsauto-123437059',
            title: 'BSauto',
            order: 0,
          },
          {
            value: 'cacao-143163',
            title: 'Cacao',
            order: 0,
          },
          {
            value: 'my-fashion-123566662',
            title: 'My fashion',
            order: 0,
          },
          {
            value: 'alloyseed',
            title: 'ALLOYSEED',
            order: 0,
          },
          {
            value: 'zip-it-good-123523804',
            title: 'Zip It Good',
            order: 0,
          },
          {
            value: 'joylife',
            title: 'JoyLife',
            order: 0,
          },
          {
            value: 'purism',
            title: 'Purism',
            order: 0,
          },
          {
            value: 'fashion-ware-123523816',
            title: 'Fashion Ware',
            order: 0,
          },
          {
            value: 'colahome-121030626',
            title: 'Colahome',
            order: 0,
          },
          {
            value: 'bradoo-121063894',
            title: 'BRADOO',
            order: 0,
          },
          {
            value: 'techshark-197723',
            title: 'Techshark',
            order: 0,
          },
          {
            value: 'husbihe-123454281',
            title: 'HUSBIHE',
            order: 0,
          },
          {
            value: 'omygon-123458887',
            title: 'OMYGON',
            order: 0,
          },
          {
            value: 'amar-shopping',
            title: 'Amar Shopping',
            order: 0,
          },
          {
            value: 'mango',
            title: 'Mango',
            order: 0,
          },
          {
            value: 'fanfanzone-123435605',
            title: 'Fanfanzone',
            order: 0,
          },
          {
            value: 'rakib-bag-in-bag-123244443',
            title: 'Rakib Bag In Bag',
            order: 0,
          },
          {
            value: 'jdxhlau-123558683',
            title: 'JDXHLAU',
            order: 0,
          },
          {
            value: 'cioqkhe-123459040',
            title: 'CIOQKHE',
            order: 0,
          },
          {
            value: 'hjsjewk-123481219',
            title: 'HJSJEWK',
            order: 0,
          },
          {
            value: 'sixfix-123454869',
            title: 'SIXFIX',
            order: 0,
          },
          {
            value: 'jinmy-123395891',
            title: 'JINMY',
            order: 0,
          },
          {
            value: 'etop',
            title: 'ETOP',
            order: 0,
          },
        ],
        title: 'Brand',
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
            value: 'FS',
            title: 'Free Shipping',
            order: 6,
          },
          {
            value: 'OS',
            title: 'DarazMall',
            order: 7,
          },
        ],
        title: 'Service',
      },
      {
        options: [
          {
            value: '-49',
            title: 'China',
            order: 0,
          },
          {
            value: '-21',
            title: 'Bangladesh',
            order: 0,
          },
        ],
        title: 'Location',
      },
      {
        showMin: 'Min',
        showMax: 'Max',
        title: 'Price',
      },
      {
        value: '0',
        title: 'Rating',
      },
      {
        options: [
          {
            value: '40599:3783',
            title: 'Leather',
            order: 0,
          },
          {
            value: '40599:61354',
            title: 'PU Leather',
            order: 0,
          },
          {
            value: '40599:12620',
            title: 'Artificial Leather',
            order: 0,
          },
          {
            value: '40599:4380',
            title: 'Fabric',
            order: 0,
          },
          {
            value: '40599:197261',
            title: 'Cotton Canvas',
            order: 0,
          },
          {
            value: '40599:4700',
            title: 'Polyester',
            order: 0,
          },
          {
            value: '40599:197262',
            title: '1680D Polyester',
            order: 0,
          },
          {
            value: '40599:4652',
            title: 'Nylon',
            order: 0,
          },
          {
            value: '40599:3777',
            title: 'Synthetic',
            order: 0,
          },
          {
            value: '40599:3827',
            title: 'Metal',
            order: 0,
          },
          {
            value: '40599:4669',
            title: 'Microfiber',
            order: 0,
          },
          {
            value: '40599:21896',
            title: 'Faux Leather',
            order: 0,
          },
          {
            value: '40599:197267',
            title: '2-tone PVC',
            order: 0,
          },
          {
            value: '40599:195710',
            title: 'Rexine',
            order: 0,
          },
          {
            value: '40599:197263',
            title: '600D Polyester',
            order: 0,
          },
          {
            value: '40599:12617',
            title: 'Latex',
            order: 0,
          },
          {
            value: '40599:12619',
            title: 'Polycarbonate',
            order: 0,
          },
          {
            value: '40599:197265',
            title: 'Polyester Jacquard',
            order: 0,
          },
          {
            value: '40599:14219',
            title: 'Suede',
            order: 0,
          },
          {
            value: '40599:197264',
            title: 'Ripstop',
            order: 0,
          },
          {
            value: '40599:14432',
            title: 'Jute',
            order: 0,
          },
          {
            value: '40599:197266',
            title: 'Tarpaulin',
            order: 0,
          },
        ],
        title: 'Outside Material',
      },
      {
        options: [
          {
            value: '30129:3731',
            title: 'Black',
            order: 0,
          },
          {
            value: '30129:3759',
            title: 'Multicolor',
            order: 0,
          },
          {
            value: '30129:3733',
            title: 'Brown',
            order: 0,
          },
          {
            value: '30129:3732',
            title: 'Blue',
            order: 0,
          },
          {
            value: '30129:3739',
            title: 'Pink',
            order: 0,
          },
          {
            value: '30129:1577',
            title: 'Red',
            order: 0,
          },
          {
            value: '30129:3736',
            title: 'Green',
            order: 0,
          },
          {
            value: '30129:3743',
            title: 'White',
            order: 0,
          },
          {
            value: '30129:3755',
            title: 'Coffee',
            order: 0,
          },
          {
            value: '30129:3746',
            title: 'Chocolate',
            order: 0,
          },
          {
            value: '30129:3744',
            title: 'Yellow',
            order: 0,
          },
          {
            value: '30129:3735',
            title: 'Grey',
            order: 0,
          },
          {
            value: '30129:3740',
            title: 'Purple',
            order: 0,
          },
          {
            value: '30129:1235',
            title: 'Maroon',
            order: 0,
          },
          {
            value: '30129:3762',
            title: 'Khaki',
            order: 0,
          },
          {
            value: '30129:3741',
            title: 'Silver',
            order: 0,
          },
          {
            value: '30129:3785',
            title: 'Navy Blue',
            order: 0,
          },
          {
            value: '30129:3734',
            title: 'Gold',
            order: 0,
          },
          {
            value: '30129:3738',
            title: 'Orange',
            order: 0,
          },
          {
            value: '30129:3737',
            title: 'Beige',
            order: 0,
          },
          {
            value: '30129:3800',
            title: 'Dark Brown',
            order: 0,
          },
          {
            value: '30129:143169',
            title: 'Light Ash',
            order: 0,
          },
          {
            value: '30129:143166',
            title: 'Dark Ash',
            order: 0,
          },
          {
            value: '30129:3775',
            title: 'Dark blue',
            order: 0,
          },
          {
            value: '30129:3780',
            title: 'Army Green',
            order: 0,
          },
          {
            value: '30129:3752',
            title: 'Blush Pink',
            order: 0,
          },
          {
            value: '30129:3808',
            title: 'Light blue',
            order: 0,
          },
          {
            value: '30129:3749',
            title: 'Apricot',
            order: 0,
          },
        ],
        type: 'multiple',
      },
      {
        options: [
          {
            value: '7:4498',
            title: 'No Warranty',
            order: 0,
          },
          {
            value: '7:123719065',
            title: 'Seller Warranty',
            order: 0,
          },
          {
            value: '7:192950',
            title: 'Brand Warranty',
            order: 0,
          },
          {
            value: '7:4492',
            title: 'Local seller warranty',
            order: 0,
          },
          {
            value: '7:4457',
            title: 'International Manufacturer Warranty',
            order: 0,
          },
          {
            value: '7:4484',
            title: 'Non-local warranty',
            order: 0,
          },
          {
            value: '7:64248',
            title: 'International Seller Warranty',
            order: 0,
          },
        ],
        title: 'Warranty Type',
      },
      {
        options: [
          {
            value: '30441:22196',
            title: 'Autumn',
            order: 0,
          },
          {
            value: '30441:4411',
            title: '2013',
            order: 0,
          },
          {
            value: '30441:22189',
            title: 'Spring',
            order: 0,
          },
          {
            value: '30441:22185',
            title: 'Summer',
            order: 0,
          },
          {
            value: '30441:143600',
            title: '2018',
            order: 0,
          },
          {
            value: '30441:3820',
            title: 'Winter',
            order: 0,
          },
          {
            value: '30441:69966',
            title: '2017',
            order: 0,
          },
          {
            value: '30441:4418',
            title: '2012',
            order: 0,
          },
        ],
        title: 'Listed Year Season',
      },
      {
        options: [
          {
            value: '31043:14246',
            title: '15-20 inches',
            order: 0,
          },
          {
            value: '31043:14250',
            title: '11-15 inches',
            order: 0,
          },
          {
            value: '31043:14233',
            title: '5-10 inches',
            order: 0,
          },
          {
            value: '31043:14249',
            title: '21 and up',
            order: 0,
          },
        ],
        title: 'Compatible Laptop Size',
      },
      {
        options: [
          {
            value: '31476:14483',
            title: 'Check',
            order: 0,
          },
          {
            value: '31476:21336',
            title: 'Animal Print',
            order: 0,
          },
          {
            value: '31476:14484',
            title: 'Plain',
            order: 0,
          },
          {
            value: '31476:21338',
            title: 'Rhombus',
            order: 0,
          },
          {
            value: '31476:14487',
            title: 'Stripe',
            order: 0,
          },
          {
            value: '31476:14119',
            title: 'Letter',
            order: 0,
          },
          {
            value: '31476:3756',
            title: 'Floral',
            order: 0,
          },
          {
            value: '31476:22742',
            title: 'Cartoon',
            order: 0,
          },
          {
            value: '31476:21335',
            title: 'Graphic',
            order: 0,
          },
          {
            value: '31476:21340',
            title: 'Joint',
            order: 0,
          },
          {
            value: '31476:64423',
            title: 'Threadwork',
            order: 0,
          },
          {
            value: '31476:21328',
            title: 'Patchwork',
            order: 0,
          },
          {
            value: '31476:341',
            title: 'Camouflage',
            order: 0,
          },
          {
            value: '31476:21334',
            title: 'Polka Dot',
            order: 0,
          },
          {
            value: '31476:21337',
            title: 'Wave point',
            order: 0,
          },
          {
            value: '31476:140702',
            title: 'Phulkari Embroidery',
            order: 0,
          },
          {
            value: '31476:21319',
            title: 'Plaid',
            order: 0,
          },
          {
            value: '31476:140704',
            title: 'Embroidery, Sequin and/or Foil Mirror Work',
            order: 0,
          },
          {
            value: '31476:21321',
            title: 'Geometric',
            order: 0,
          },
          {
            value: '31476:21678',
            title: 'Sequence',
            order: 0,
          },
          {
            value: '31476:140706',
            title: 'Semi Stitched',
            order: 0,
          },
          {
            value: '31476:140705',
            title: 'Patti Work',
            order: 0,
          },
          {
            value: '31476:140699',
            title: 'Kashmiri Embroidery',
            order: 0,
          },
          {
            value: '31476:22985',
            title: 'Gingham',
            order: 0,
          },
          {
            value: '31476:42614',
            title: 'Brocade',
            order: 0,
          },
          {
            value: '31476:140701',
            title: 'Aari Embroidery',
            order: 0,
          },
          {
            value: '31476:22693',
            title: 'Splice',
            order: 0,
          },
          {
            value: '31476:21327',
            title: 'Paisley',
            order: 0,
          },
        ],
        title: 'Pattern',
      },
      {
        pid: '8',
        options: [
          {
            value: '8:4447',
            title: '1 Year',
            order: 0,
          },
          {
            value: '8:4448',
            title: '3 Years',
            order: 0,
          },
          {
            value: '8:4446',
            title: '2 Years',
            order: 0,
          },
          {
            value: '8:4456',
            title: '6 Months',
            order: 0,
          },
          {
            value: '8:4462',
            title: '3 Months',
            order: 0,
          },
          {
            value: '8:2503',
            title: '7',
            order: 0,
          },
          {
            value: '8:4454',
            title: '5 Years',
            order: 0,
          },
          {
            value: '8:4463',
            title: '1 Month',
            order: 0,
          },
          {
            value: '8:4464',
            title: '5 Months',
            order: 0,
          },
          {
            value: '8:4489',
            title: '8 Months',
            order: 0,
          },
          {
            value: '8:4461',
            title: '2 Months',
            order: 0,
          },
          {
            value: '8:3918',
            title: '1',
            order: 0,
          },
          {
            value: '8:2486',
            title: '6',
            order: 0,
          },
          {
            value: '8:2490',
            title: '5',
            order: 0,
          },
          {
            value: '8:2510',
            title: '10',
            order: 0,
          },
          {
            value: '8:4483',
            title: '4 Years',
            order: 0,
          },
          {
            value: '8:2682',
            title: '3',
            order: 0,
          },
          {
            value: '8:4455',
            title: '10 Months',
            order: 0,
          },
          {
            value: '8:4502',
            title: 'Life Time Warranty',
            order: 0,
          },
          {
            value: '8:2408',
            title: '26',
            order: 0,
          },
          {
            value: '8:4443',
            title: '10 Years',
            order: 0,
          },
          {
            value: '8:2409',
            title: '42',
            order: 0,
          },
          {
            value: '8:4460',
            title: '4 Months',
            order: 0,
          },
          {
            value: '8:4478',
            title: '11 Months',
            order: 0,
          },
          {
            value: '8:2737',
            title: '15',
            order: 0,
          },
        ],
        title: 'Warranty Period',
      },
      {
        options: [
          {
            value: '40693:198857',
            title: 'Zippers',
            order: 0,
          },
          {
            value: '40693:90135',
            title: 'Buckles',
            order: 0,
          },
          {
            value: '40693:21273',
            title: 'Hook and Loop',
            order: 0,
          },
          {
            value: '40693:21224',
            title: 'Drawstring',
            order: 0,
          },
          {
            value: '40693:198858',
            title: 'Magnetic Snaps',
            order: 0,
          },
          {
            value: '40693:198081',
            title: 'Buttons',
            order: 0,
          },
          {
            value: '40693:198859',
            title: 'Twist & Lock',
            order: 0,
          },
          {
            value: '40693:198860',
            title: 'Side Release Buckle',
            order: 0,
          },
          {
            value: '40693:198862',
            title: 'Tuck lock',
            order: 0,
          },
          {
            value: '40693:198861',
            title: 'Hook & Eye',
            order: 0,
          },
        ],
        title: 'Closure Type',
      },
    ];
  }

  private getNextPage(data: boolean, total: number, pageNum: number): number {
    if (data) return null;
    return Math.ceil(total / config.pageLimit) === pageNum ? null : pageNum + 1;
  }

  async getCategoryLeftFilter(categoryId: number, data: any): Promise<any> {
    //console.log(data.data[0]);
    const getCategoryLeftFilter = await this.categoryLeftFilter.find({
      categoryId: categoryId,
    });

    // console.log(getCategoryLeftFilter);
    // console.log(data.data);
    const filteredAttr = [];

    for (const item of getCategoryLeftFilter) {
      let matchCount = 0;
      let totalCount = Object.keys(data).length;
      for (const [userKey, userValue] of Object.entries<string>(data)) {
        if (item.data[userKey]) {
          if (
            item.data[userKey].toLowerCase().trim() ===
            userValue.toLowerCase().trim()
          ) {
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
        const attr_cap = attr_low.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
          letter.toUpperCase(),
        );

        attrObj = {
          categoryId: item.categoryId,
          attributeName: key,
          attributeLabel: attr_cap,
          attributeValue: value,
        };

        categoryAttr.push(attrObj);
      }
    }

    const results = [];

    for (const item of categoryAttr) {
      const resItem = results.findIndex(
        (e) =>
          e.categoryId === item.categoryId &&
          e.attributeName === item.attributeName,
      );
      if (resItem !== -1) {
        results[resItem].attributeValue = Array.from(
          new Set([...results[resItem].attributeValue, item.attributeValue]),
        );
      } else {
        results.push({ ...item, attributeValue: [item.attributeValue] });
      }
    }

    const f_res = results.map((e) => {
      const attr = e.attributeValue.map((m) => {
        return {
          title: m,
          value: m,
        };
      });

      return {
        categoryId: e.categoryId,
        attributeName: e.attributeName,
        attributeLabel: e.attributeLabel,
        attributeValue: attr,
      };
    });

    return f_res;
  }

  async createAttribute(
    categoryId: number,
    sellerId: string,
    data: any,
  ): Promise<any> {
    //console.log(data.data[0]);
    //const storePro = await this.productInfo.find();

    const attrData = {};
    for (const item of data) {
      const userKey = item.key;
      const userValue = item.value;

      if (userKey) {
        attrData[userKey] = userValue;
      }
    }

    const obj = {
      categoryId: categoryId,
      sellerId: sellerId,
      data: attrData,
    };

    const isExist = await this.categoryLeftFilter.findOne({
      categoryId: categoryId,
      sellerId: sellerId,
      data,
    });

    if (isExist === null) {
      const seller_attr_save_result = await this.categoryLeftFilter.create(obj);
    }
  }
}
