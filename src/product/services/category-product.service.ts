import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { customDataPaginator, paginate } from 'src/utils/paginate';
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
    @InjectModel(Category)
    private readonly category: ReturnModelType<typeof Category>,

    private readonly categoryService: CategoryService,
  ) {}

  private paginate = paginate;
  private customDataPaginator = customDataPaginator;

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

    const productData = await this.productModel.find(query).exec();

    const product = await this.customDataPaginator(
      productData,
      pageNum,
      config.paginateViewLimit,
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
      totalCount: product.totalCount,
      currentPage: pageNum,
      totalPages: product.totalPages,
      nextPage: product.nextPage,
      showingFrom: product.from,
      showingTo: product.to,
    };
  }

  // async getCategoryProductFilter(id) {
  //   return [
  //     {
  //       options: [
  //         {
  //           value: 'bags-travel',
  //           label: 'Bags and Travel',
  //         },
  //       ],
  //       title: 'Related Categories',
  //     },
  //     {
  //       options: [
  //         {
  //           value: 'greatwall',
  //           label: 'Greatwall',
  //           order: 0,
  //         },
  //         {
  //           value: 'dream-leather-world',
  //           label: 'Dream Leather World',
  //           order: 0,
  //         },
  //         {
  //           value: 'easy-live',
  //           label: 'EASY LIVE',
  //           order: 0,
  //         },
  //         {
  //           value: 'new-top-ten',
  //           label: 'New Top Ten',
  //           order: 0,
  //         },
  //         {
  //           value: 'lemon-14711',
  //           label: 'Lemon',
  //           order: 0,
  //         },
  //         {
  //           value: 'royal-bagger-123559412',
  //           label: 'Royal Bagger',
  //           order: 0,
  //         },
  //         {
  //           value: 'bsauto-123437059',
  //           label: 'BSauto',
  //           order: 0,
  //         },
  //         {
  //           value: 'cacao-143163',
  //           label: 'Cacao',
  //           order: 0,
  //         },
  //         {
  //           value: 'my-fashion-123566662',
  //           label: 'My fashion',
  //           order: 0,
  //         },
  //         {
  //           value: 'alloyseed',
  //           label: 'ALLOYSEED',
  //           order: 0,
  //         },
  //         {
  //           value: 'zip-it-good-123523804',
  //           label: 'Zip It Good',
  //           order: 0,
  //         },
  //         {
  //           value: 'joylife',
  //           label: 'JoyLife',
  //           order: 0,
  //         },
  //         {
  //           value: 'purism',
  //           label: 'Purism',
  //           order: 0,
  //         },
  //         {
  //           value: 'fashion-ware-123523816',
  //           label: 'Fashion Ware',
  //           order: 0,
  //         },
  //         {
  //           value: 'colahome-121030626',
  //           label: 'Colahome',
  //           order: 0,
  //         },
  //         {
  //           value: 'bradoo-121063894',
  //           label: 'BRADOO',
  //           order: 0,
  //         },
  //         {
  //           value: 'techshark-197723',
  //           label: 'Techshark',
  //           order: 0,
  //         },
  //         {
  //           value: 'husbihe-123454281',
  //           label: 'HUSBIHE',
  //           order: 0,
  //         },
  //         {
  //           value: 'omygon-123458887',
  //           label: 'OMYGON',
  //           order: 0,
  //         },
  //         {
  //           value: 'amar-shopping',
  //           label: 'Amar Shopping',
  //           order: 0,
  //         },
  //         {
  //           value: 'mango',
  //           label: 'Mango',
  //           order: 0,
  //         },
  //         {
  //           value: 'fanfanzone-123435605',
  //           label: 'Fanfanzone',
  //           order: 0,
  //         },
  //         {
  //           value: 'rakib-bag-in-bag-123244443',
  //           label: 'Rakib Bag In Bag',
  //           order: 0,
  //         },
  //         {
  //           value: 'jdxhlau-123558683',
  //           label: 'JDXHLAU',
  //           order: 0,
  //         },
  //         {
  //           value: 'cioqkhe-123459040',
  //           label: 'CIOQKHE',
  //           order: 0,
  //         },
  //         {
  //           value: 'hjsjewk-123481219',
  //           label: 'HJSJEWK',
  //           order: 0,
  //         },
  //         {
  //           value: 'sixfix-123454869',
  //           label: 'SIXFIX',
  //           order: 0,
  //         },
  //         {
  //           value: 'jinmy-123395891',
  //           label: 'JINMY',
  //           order: 0,
  //         },
  //         {
  //           value: 'etop',
  //           label: 'ETOP',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Brand',
  //     },
  //     {
  //       options: [
  //         {
  //           value: 'INSTALLMENT',
  //           label: 'Installment',
  //           order: 3,
  //         },
  //         {
  //           value: 'COD',
  //           label: 'Cash On Delivery',
  //           order: 4,
  //         },
  //         {
  //           value: 'FBL',
  //           label: 'Fulfilled By Daraz',
  //           order: 5,
  //         },
  //         {
  //           value: 'FS',
  //           label: 'Free Shipping',
  //           order: 6,
  //         },
  //         {
  //           value: 'OS',
  //           label: 'DarazMall',
  //           order: 7,
  //         },
  //       ],
  //       title: 'Service',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '-49',
  //           label: 'China',
  //           order: 0,
  //         },
  //         {
  //           value: '-21',
  //           label: 'Bangladesh',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Location',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '40599:3783',
  //           label: 'Leather',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:61354',
  //           label: 'PU Leather',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:12620',
  //           label: 'Artificial Leather',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:4380',
  //           label: 'Fabric',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197261',
  //           label: 'Cotton Canvas',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:4700',
  //           label: 'Polyester',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197262',
  //           label: '1680D Polyester',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:4652',
  //           label: 'Nylon',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:3777',
  //           label: 'Synthetic',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:3827',
  //           label: 'Metal',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:4669',
  //           label: 'Microfiber',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:21896',
  //           label: 'Faux Leather',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197267',
  //           label: '2-tone PVC',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:195710',
  //           label: 'Rexine',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197263',
  //           label: '600D Polyester',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:12617',
  //           label: 'Latex',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:12619',
  //           label: 'Polycarbonate',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197265',
  //           label: 'Polyester Jacquard',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:14219',
  //           label: 'Suede',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197264',
  //           label: 'Ripstop',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:14432',
  //           label: 'Jute',
  //           order: 0,
  //         },
  //         {
  //           value: '40599:197266',
  //           label: 'Tarpaulin',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Outside Material',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '30129:3731',
  //           label: 'Black',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3759',
  //           label: 'Multicolor',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3733',
  //           label: 'Brown',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3732',
  //           label: 'Blue',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3739',
  //           label: 'Pink',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:1577',
  //           label: 'Red',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3736',
  //           label: 'Green',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3743',
  //           label: 'White',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3755',
  //           label: 'Coffee',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3746',
  //           label: 'Chocolate',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3744',
  //           label: 'Yellow',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3735',
  //           label: 'Grey',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3740',
  //           label: 'Purple',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:1235',
  //           label: 'Maroon',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3762',
  //           label: 'Khaki',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3741',
  //           label: 'Silver',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3785',
  //           label: 'Navy Blue',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3734',
  //           label: 'Gold',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3738',
  //           label: 'Orange',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3737',
  //           label: 'Beige',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3800',
  //           label: 'Dark Brown',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:143169',
  //           label: 'Light Ash',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:143166',
  //           label: 'Dark Ash',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3775',
  //           label: 'Dark blue',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3780',
  //           label: 'Army Green',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3752',
  //           label: 'Blush Pink',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3808',
  //           label: 'Light blue',
  //           order: 0,
  //         },
  //         {
  //           value: '30129:3749',
  //           label: 'Apricot',
  //           order: 0,
  //         },
  //       ],
  //       type: 'multiple',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '7:4498',
  //           label: 'No Warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:123719065',
  //           label: 'Seller Warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:192950',
  //           label: 'Brand Warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:4492',
  //           label: 'Local seller warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:4457',
  //           label: 'International Manufacturer Warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:4484',
  //           label: 'Non-local warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '7:64248',
  //           label: 'International Seller Warranty',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Warranty Type',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '30441:22196',
  //           label: 'Autumn',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:4411',
  //           label: '2013',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:22189',
  //           label: 'Spring',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:22185',
  //           label: 'Summer',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:143600',
  //           label: '2018',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:3820',
  //           label: 'Winter',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:69966',
  //           label: '2017',
  //           order: 0,
  //         },
  //         {
  //           value: '30441:4418',
  //           label: '2012',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Listed Year Season',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '31043:14246',
  //           label: '15-20 inches',
  //           order: 0,
  //         },
  //         {
  //           value: '31043:14250',
  //           label: '11-15 inches',
  //           order: 0,
  //         },
  //         {
  //           value: '31043:14233',
  //           label: '5-10 inches',
  //           order: 0,
  //         },
  //         {
  //           value: '31043:14249',
  //           label: '21 and up',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Compatible Laptop Size',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '31476:14483',
  //           label: 'Check',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21336',
  //           label: 'Animal Print',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:14484',
  //           label: 'Plain',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21338',
  //           label: 'Rhombus',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:14487',
  //           label: 'Stripe',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:14119',
  //           label: 'Letter',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:3756',
  //           label: 'Floral',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:22742',
  //           label: 'Cartoon',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21335',
  //           label: 'Graphic',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21340',
  //           label: 'Joint',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:64423',
  //           label: 'Threadwork',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21328',
  //           label: 'Patchwork',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:341',
  //           label: 'Camouflage',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21334',
  //           label: 'Polka Dot',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21337',
  //           label: 'Wave point',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140702',
  //           label: 'Phulkari Embroidery',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21319',
  //           label: 'Plaid',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140704',
  //           label: 'Embroidery, Sequin and/or Foil Mirror Work',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21321',
  //           label: 'Geometric',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21678',
  //           label: 'Sequence',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140706',
  //           label: 'Semi Stitched',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140705',
  //           label: 'Patti Work',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140699',
  //           label: 'Kashmiri Embroidery',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:22985',
  //           label: 'Gingham',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:42614',
  //           label: 'Brocade',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:140701',
  //           label: 'Aari Embroidery',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:22693',
  //           label: 'Splice',
  //           order: 0,
  //         },
  //         {
  //           value: '31476:21327',
  //           label: 'Paisley',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Pattern',
  //     },
  //     {
  //       pid: '8',
  //       options: [
  //         {
  //           value: '8:4447',
  //           label: '1 Year',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4448',
  //           label: '3 Years',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4446',
  //           label: '2 Years',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4456',
  //           label: '6 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4462',
  //           label: '3 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2503',
  //           label: '7',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4454',
  //           label: '5 Years',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4463',
  //           label: '1 Month',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4464',
  //           label: '5 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4489',
  //           label: '8 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4461',
  //           label: '2 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:3918',
  //           label: '1',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2486',
  //           label: '6',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2490',
  //           label: '5',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2510',
  //           label: '10',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4483',
  //           label: '4 Years',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2682',
  //           label: '3',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4455',
  //           label: '10 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4502',
  //           label: 'Life Time Warranty',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2408',
  //           label: '26',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4443',
  //           label: '10 Years',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2409',
  //           label: '42',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4460',
  //           label: '4 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:4478',
  //           label: '11 Months',
  //           order: 0,
  //         },
  //         {
  //           value: '8:2737',
  //           label: '15',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Warranty Period',
  //     },
  //     {
  //       options: [
  //         {
  //           value: '40693:198857',
  //           label: 'Zippers',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:90135',
  //           label: 'Buckles',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:21273',
  //           label: 'Hook and Loop',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:21224',
  //           label: 'Drawstring',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198858',
  //           label: 'Magnetic Snaps',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198081',
  //           label: 'Buttons',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198859',
  //           label: 'Twist & Lock',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198860',
  //           label: 'Side Release Buckle',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198862',
  //           label: 'Tuck lock',
  //           order: 0,
  //         },
  //         {
  //           value: '40693:198861',
  //           label: 'Hook & Eye',
  //           order: 0,
  //         },
  //       ],
  //       title: 'Closure Type',
  //     },
  //   ];
  // }

  private getNextPage(data: boolean, total: number, pageNum: number): number {
    if (data) return null;
    return Math.ceil(total / config.pageLimit) === pageNum ? null : pageNum + 1;
  }

  async findLastChild(categoryID: number) {
    let categoryIDs = [];
    const docs = await this.category.find({ parentId: categoryID });
    //console.log({ parentID: categoryID, totalChild: docs.length })
    for (const doc of docs) {
      // console.log({ isLeaf: doc.leaf })
      if (doc.leaf) {
        categoryIDs.push({
          name: doc.categoryName,
          categoryId: doc.categoryId,
        });
      } else {
        const data = await this.findLastChild(doc.categoryId);
        categoryIDs = [...categoryIDs, ...data];
      }
    }
    return categoryIDs;
  }

  async getCategoryProductFilter(categoryId, data?: {}): Promise<any> {
    let categoryIDs = [];

    categoryId = 2145;
    data = { brand: 'Apex' };
    console.log(categoryId);

    const docs = await this.category.find({ parentId: categoryId });
    console.log(docs);

    if (docs.length > 0) {
      for (const doc of docs) {
        if (doc.leaf) {
          categoryIDs.push({
            name: doc.categoryName,
            categoryId: doc.categoryId,
          });
        } else {
          const idList = await this.findLastChild(doc.categoryId);
          categoryIDs = [...categoryIDs, ...idList];
        }
      }
    } else {
      //if there's no children assume the category itself is a leaf
      const doc = await this.category.findOne({ categoryId });
      categoryIDs.push({ name: doc.categoryName, categoryId: doc.categoryId });
    }

    //console.log(docs.length)
    //return categoryIDs;

    //console.log(childCategoryList);
    let getCategoryLeftFilter = [];
    let results = [];
    let categoryAttr = [];
    let filteredAttr = [];

    for (const childCategory of categoryIDs) {
      //console.log(childCategory);

      getCategoryLeftFilter = [];
      const dCatId = await (
        await this.category
          .findOne({ categoryId: childCategory.categoryId })
          .select('dCategoryId')
      ).dCategoryId;

      getCategoryLeftFilter = await this.categoryLeftFilter.find({
        categoryId: dCatId,
      });

      filteredAttr = [];
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

      categoryAttr = [];
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
    }

    console.log(results);

    //console.log(results);

    const f_res = results.map((e) => {
      const attr = e.attributeValue.map((m) => {
        return {
          title: m,
          value: m,
        };
      });

      return {
        options: attr,
        title: e.attributeLabel,
      };
    });

    return f_res;
  }

  async getStoreLeftFilter(sellerId: string, data: any): Promise<any> {
    let getSellerLeftFilter = [];
    let results = [];
    let categoryAttr = [];
    let filteredAttr = [];

    getSellerLeftFilter = await this.categoryLeftFilter.find({
      sellerId: sellerId,
    });

    for (const item of getSellerLeftFilter) {
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

    categoryAttr = [];
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
        options: attr,
        title: e.attributeLabel,
      };
    });

    return f_res;
  }

  public async createAttribute(
    categoryId: any,
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
