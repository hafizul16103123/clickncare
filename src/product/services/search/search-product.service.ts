import { HttpException, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { IPaginatedData, paginate } from 'src/utils/paginate';
import config from '../../../configuration';
import { Product } from '../../entities/product.entity';

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
    // console.log({ key, color, size, minPrice, maxPrice });
    const query: unknown = {};
    if (key.key !== null) {
      query['productName'] = { $regex: '.*' + key.key + '.*' };
    }
    if (key.color !== undefined) {
      query['priceStock.color'] = {
        $regex: '.*' + key.color + '.*',
        $options: 'i',
      };
    }
    if (size !== undefined) {
      query['priceStock.size'] = parseInt(key.size);
    }
    if (key.minPrice !== undefined && key.maxPrice === undefined) {
      query['priceStock.price'] = { $gte: parseInt(key.minPrice) };
    } else if (key.maxPrice !== undefined && key.minPrice === undefined) {
      query['priceStock.price'] = { $lte: parseInt(key.maxPrice) };
    } else if (key.minPrice !== undefined && key.maxPrice !== undefined) {
      query['priceStock.price'] = {
        $gte: parseInt(key.minPrice),
        $lte: parseInt(key.maxPrice),
      };
    }

    const doc = await this.paginate<Product>(
      this.productModel
        .find(query)
        .skip((pageNum - 1) * config.pageLimit)
        .limit(config.pageLimit),
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
      title: key.key,
      banner: {
        image:
          'https://firebasestorage.googleapis.com/v0/b/zdrop-7d8d4.appspot.com/o/Category%2Fbanner%2Flarge%2FGroup%206431.png?alt=media&token=9ed2da12-1d7f-4979-8394-3d22631f49e7',
        alt: key.key,
      },
    };

    if (!doc) throw new HttpException('Products not found', 404);
    delete doc.data;
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

  async getSearchProductFilter(text) {
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

  // Recommended products
  async recommendedProducts(productID: number): Promise<any | null> {
    const productDoc = await this.productModel
      .findOne({ productID: productID })
      .exec();

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
          sellerID: sellerID,
        });

        return {
          count: returnData,
          title: `${e}`,
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

  async getSuggesion(text: string) {
    const data = await this.productModel
      .find({ productName: { $regex: '.*' + text + '.*', $options: 'i' } })
      .select({ productName: 1, _id: 0 })
      .limit(5);

    const suggestion = data.map((e) => {
      return e.productName;
    });

    const final = {
      suggestion: suggestion,
      tending: suggestion,
    };

    return final;
  }
}
