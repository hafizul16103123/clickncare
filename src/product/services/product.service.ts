import { HttpException, Inject, Injectable } from '@nestjs/common';
import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { IPaginatedData, paginate } from 'src/utils/paginate';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import {
  UpdateProductActiveStatus,
  UpdateProductApproveStatus,
} from '../dto/update-approve-status.dto';
import { SellerColor } from '../entities/color.entity';
import { SellerSize } from '../entities/size.entity';
import { SellerCountry } from '../entities/country.entity';
import { SellerBrand } from '../entities/brand.entity';

import { ClientProxy } from '@nestjs/microservices';
import { ProductReview } from '../entities/review/product_review.entity';
import { ProductReviewService } from './review/product_review.service';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductService {
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
    @Inject('MICRO_SERVICE') private readonly redis: ClientProxy,

    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,

    private readonly productReview: ProductReviewService,
  ) {}

  private paginate = paginate;

  async addProduct(data: CreateProductDto, z_id: string): Promise<any> {
    data.sellerID = 'ZDSEL1613990069';
    const lastProduct = await this.productModel
      .findOne()
      .sort({ _id: -1 })
      .limit(1);
    if (lastProduct === null) {
      data.productID = 1;
    } else {
      data.productID = lastProduct.productID + 1;
    }

    const price_stock = data.priceStock;

    const color = [];
    const size = [];
    const price = [];

    const cl = data.color.map((e, index) => {
      return {
        propertyValueId: index,
        propertyName: e,
        image: {
          large: '',
          small: '',
        },
      };
    });

    const sz = data.size.map((e, index) => {
      return {
        propertyValueId: index,
        propertyName: e,
      };
    });

    for (let index = 0; index < price_stock.length; index++) {
      const main = price_stock[index];

      for (let index = 0; index < cl.length; index++) {
        const element = cl[index];
        element.image.large = main.image;
        element.image.small = main.smallImage;

        for (let index = 0; index < sz.length; index++) {
          const element1 = sz[index];

          if (main.color == element.propertyName) {
            if (main.size == element1.propertyName) {
              color.push({
                availability: true,
                propertyValueDefinitionName: element.propertyName,
                propertyValueDisplayName: element.propertyName,
                skuColorValue: element.propertyName,
                propertyValueId: index,
                skuPropertyImagePath: main.image,
              });

              size.push({
                availability: true,
                propertyValueDefinitionName: element1.propertyName,
                propertyValueDisplayName: element1.propertyName,
                skuColorValue: element1.propertyName,
                propertyValueId: index,
              });

              price.push({
                skuPropIds:
                  element.propertyValueId + ',' + element1.propertyValueId,
                globalSKU: main.globalSKU,
                skuVal: {
                  actSkuCalPrice: main.price,
                  price: main.price,
                  availQuantity: main.quantity,
                  isActivity: true,
                },
              });
            }
          }
        }
      }
    }

    let sizeTypeExist;
    if (data.sizeType) {
      sizeTypeExist = true;
    }

    //let attribute;

    let m = [
      {
        name: 'color',
        value: ['red', 'blue', 'green'],
      },
      {
        name: 'size',
        value: ['41', '42', '43'],
      },
      {
        name: 'capacity',
        value: ['4 GB', '6 GB', '8 GB'],
      },
    ];

    data.varient = m;

    // GET seller and inserting sellerID in product
    //const seller = await this.profileModel.findOne({ z_id: z_id });
    //data.sellerID = seller.sellerID;
    // console.log(data);
    const savedProduct = await this.productModel.create(data);

    this.insertColor(data.sellerID, data.color);
    this.insertSize(data.sellerID, data.size);
    this.insertBrandAndCountry(data.sellerID, data.specification);

    return savedProduct;
  }

  private async insertColor(sellerID: string, color: any): Promise<void> {
    for (let index = 0; index < color.length; index++) {
      const element = color[index];
      const colorName = await this.colorModel.findOne({
        color: element,
        sellerID: sellerID,
      });

      if (colorName == null) {
        await this.colorModel.create({ sellerID, color: element });
      }
    }
  }
  private async insertSize(sellerID: string, size: any): Promise<void> {
    for (let index = 0; index < size.length; index++) {
      const element = size[index];

      const sizeVal = await this.sizeModel.findOne({
        size: element,
        sellerID: sellerID,
      });
      if (sizeVal == null) {
        await this.sizeModel.create({ sellerID, size: element });
      }
    }
  }
  private async insertBrandAndCountry(
    sellerID: string,
    specs: any,
  ): Promise<void> {
    for (let index = 0; index < specs.length; index++) {
      const element = specs[index];
      //console.log(element);
      if (element.key === 'brand' || element.key === 'Brand') {
        const brandVal = await this.brandModel.findOne({
          brandName: element.value,
          sellerID: sellerID,
        });
        console.log(brandVal);
        if (brandVal == null) {
          await this.brandModel.create({ sellerID, brandName: element.value });
        }
      } else if (element.key === 'country' || element.key === 'Country') {
        // We are searching the country DB by value (ex: 'Bangladesh'). if it returns nothing, that means we can insert it into the DB
        // else we will ignore it
        const countryVal = await this.countryModel.findOne({
          country: element.value,
          sellerID: sellerID,
        });
        console.log(countryVal);

        if (countryVal == null) {
          await this.countryModel.create({
            sellerID,
            country: element.value,
          });
        }
      }
    }
  }
  async getAllProducts(pageNum = 1): Promise<IPaginatedData<Product[]>> {
    const data = await this.paginate<Product>(this.productModel, pageNum);

    return data;
  }
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

  async getSingleProduct(id: number): Promise<any> {
    const data = await this.productModel.findOne({
      productID: id,
    });

    //seller
    const seller = await this.redis
      .send({ cmd: 'SELLER_ALL_INFO_BY_SELLERID' }, data.sellerID)
      .toPromise();

    // image map
    const imagePathList = data.priceStock.map((e) => {
      return {
        large: e.image,
        small: e.smallImage,
        alt: data.productName,
      };
    });

    // review
    const rating = await this.productReview.getProductReview(data.productID);

    const product = {
      imageModule: imagePathList,
      specsModule: data.specification,
      priceModule: {
        priceStock: data.priceStock,
        discount: 5,
        currentPriceModule: {
          formatedAmount: 'BDT ' + data.priceStock[0].price,
          value: data.priceStock[0].price,
        },
        oldPriceModule: {
          formatedAmount:
            'BDT ' + (await this.getDiscountPrice(5, data.priceStock[0].price)),
          value: await this.getDiscountPrice(5, data.priceStock[0].price),
        },
      },
      shippingModule: {
        company: 'Whirlpool',
        condition: 'Cash on delivery not available',
      },
      deliveryModule: {
        address: {
          name: 'Dhaka North - Middle Badda',
          value: '45403jsdnbuowrht03u',
          charge: 60,
        },
        duration: 'Usually delivered in 4-5 days to this area',
      },
      ratingModule: {
        ratingCount: 200,
        reviewCount: 23,
        rating: rating,
      },
      returnAndWarrentyModule: data.serviceDelivery,
      productModule: {
        _id: data._id,
        productName: data.productName,
        productID: data.productID,
        country: '',
        globalStock: 100,
      },
      categoryModule: {
        categoryName: '',
        categoryID: data.categoryId,
        categoryTree: await this.getCategoryRoute(
          data.categoryId,
          data.productName,
        ),
      },
      mediaModule: {
        video: data.video,
      },
      descriptionModule: {
        highlights: data.highlights,
        longDescription: data.longDescription,
        englishDescription: data.englishDescription,
        whatInTheBox: data.whatInTheBox,
      },
      preSaleModule: {
        preSale: false,
      },
      skuModule: await this.getVarient(data.productID),
      sellerModule: {
        sellerID: data.sellerID,
        sellerName: seller.profile.shop_name,
        country: '',
      },
      orderModule: {
        orderCount: 100,
      },
      brandModule: {
        brand: 'Apex',
        country: 'Bangladesh',
      },
      meta: {
        imagePath: data.image[0],
        keywords: data.productName,
        ogDescription: data.highlights,
        ogTitle: data.productName,
        productID: data.productID,
        title: data.productName,
      },
    };

    return product;
  }

  async getCategoryRoute(categoryId, productName) {
    return [
      {
        categoryID: '601236f7953448206c22496e',
        categoryName: 'Bags and Travel',
      },
      {
        categoryID: '601236f7953448206c22496f',
        categoryName: 'Kids Bags',
      },
      {
        categoryID: '',
        categoryName: productName,
      },
    ];
  }

  async getDiscountPrice(parcentage, price) {
    const minusPrice = (parcentage * price) / 100;
    return price - minusPrice;
  }

  async getProductById(id: number): Promise<any> {
    console.log(id);
    const data = await this.productModel.findOne({
      productID: id,
    });

    return data;
  }

  async updateProductInfo(
    id: number,
    data: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel.findOne({ productID: id }).exec();

    if (!product) throw new HttpException('Product data not found!', 404);

    const price_stock = data.priceStock;

    const color = [];
    const size = [];
    const price = [];

    const cl = data.color.map((e, index) => {
      return {
        propertyValueId: index,
        color: e,
      };
    });

    const sz = data.size.map((e, index) => {
      return {
        propertyValueId: index,
        size: e,
      };
    });

    for (let index = 0; index < price_stock.length; index++) {
      const main = price_stock[index];

      for (let index = 0; index < cl.length; index++) {
        const element = cl[index];

        for (let index = 0; index < sz.length; index++) {
          const element1 = sz[index];

          if (main.color == element.color) {
            if (main.size == element1.size) {
              color.push({
                availability: true,
                propertyValueDefinitionName: element.color,
                propertyValueDisplayName: element.color,
                skuColorValue: element.color,
                propertyValueId: index,
                skuPropertyImagePath: main.image,
              });

              size.push({
                availability: true,
                propertyValueDefinitionName: element1.size,
                propertyValueDisplayName: element1.size,
                skuColorValue: element1.size,
                propertyValueId: index,
              });

              price.push({
                skuPropIds:
                  element.propertyValueId + ',' + element1.propertyValueId,
                skuVal: {
                  actSkuCalPrice: main.price,
                  price: main.price,
                  availQuantity: main.quantity,
                  isActivity: true,
                },
              });
            }
          }
        }
      }
    }
    let sizeTypeExist;
    if (data.sizeType) {
      sizeTypeExist = true;
    }
    data.varient = {
      color: color,
      size: {
        ...(sizeTypeExist && { sizeType: data.sizeType }),
        size,
      },
      price: price,
      skuBase: { color: cl, size: sz },
    };

    for (const key of Object.keys(data)) {
      product[key] = data[key];
    }
    return (await product.save()).toJSON();
  }

  // below routes required
  async activateStatus(
    id: number,
    activateProduct: UpdateProductActiveStatus,
  ): Promise<Product> {
    // Following Code checks if the value coming from the DTO is Active then run update it accordingly
    if (
      activateProduct.active_status === 'Active' ||
      activateProduct.active_status === 'active'
    ) {
      const doc = await this.productModel.findOne({ productID: id }).exec();

      if (!doc) throw new HttpException('Product data not found!', 404);

      for (const key of Object.keys(activateProduct)) {
        doc[key] = activateProduct[key];
      }
      return (await doc.save()).toJSON();
    }
    // If deactive then  update it accordingly
    else if (
      activateProduct.active_status === 'Deactive' ||
      activateProduct.active_status === 'deactive'
    ) {
      // find the data related to the ID in the param
      const doc = await this.productModel.findOne({ productID: id }).exec();
      // if nit found
      if (!doc) throw new HttpException('Product data not found!', 404);
      // updates the doc with deactive
      for (const key of Object.keys(activateProduct)) {
        doc[key] = activateProduct[key];
      }
      return (await doc.save()).toJSON();
    } else {
      // 3rd case: if entered data do not match active or deactive
      throw new HttpException(
        'Entered data not valid! Please enter either active or deactive',
        401,
      );
    }
  }

  async approveStatus(
    id: number,
    approveProduct: UpdateProductApproveStatus,
  ): Promise<Product> {
    // checks if approved or not
    if (
      approveProduct.approve_status === 'approved' ||
      approveProduct.approve_status === 'Approved'
    ) {
      const doc = await this.productModel.findOne({ productID: id }).exec();

      if (!doc) throw new HttpException('Product data not found!', 404);

      // if approved the n update the data
      for (const key of Object.keys(approveProduct)) {
        doc[key] = approveProduct[key];
      }
      return (await doc.save()).toJSON();
    } else if (
      approveProduct.approve_status === 'Disapproved' ||
      approveProduct.approve_status === 'disapproved'
    ) {
      const doc = await this.productModel.findOne({ productID: id }).exec();

      if (!doc) throw new HttpException('Product data not found!', 404);

      for (const key of Object.keys(approveProduct)) {
        doc[key] = approveProduct[key];
      }
    } else {
      // 3rd case: if entered something other than above then this code runs
      throw new HttpException(
        'Entered Data Not Valid! Please enter either approved or disapproved',
        401,
      );
    }
  }

  // get products by globalSKU. This is being accesssed by microservice
  async productsBySKU({ productID, globalSKU }): Promise<any> {
    const hasProduct = await this.productModel
      .findOne({ productID: productID, 'priceStock.globalSKU': globalSKU })
      .exec();

    return hasProduct;
  }

  async getAttributeBySKU({ productID, globalSKU }): Promise<any> {
    const hasProduct = await this.productModel
      .findOne({ productID: productID, 'priceStock.globalSKU': globalSKU })
      .exec();

    return hasProduct.priceStock.filter((e) => e.globalSKU == globalSKU);
  }

  async saveDarazProduct(data: any, z_id: string): Promise<any> {
    console.log(data);
    data.categoryId = new mongoose.Types.ObjectId('5e997f95d6a35f3a0def3339');
    return await this.productModel.create(data);
  }

  // microservice
  async getStoreHomepage({
    sellerID,
    page,
    minPrice,
    maxPrice,
    searchKey,
    sortBy,
  }): Promise<any> {
    console.log(sellerID, page, minPrice, maxPrice, searchKey, sortBy);

    const product = await this.paginate<Product>(
      this.productModel.find({ sellerID }).sort([['priceStock.price', 'desc']]),
      page,
    );

    const newArrival = await this.productModel
      .find({ sellerID })
      .sort({ _id: -1 })
      .limit(10);

    const newArrivalFinalData = newArrival.map((e) => {
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
          discountAmount: 10,
          discountPercentage: 10,
        },
        country: 'China',
      };
    });

    const finalProduct = (await product).data.map((e) => {
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
          discountAmount: 10,
          discountPercentage: 10,
        },
        country: 'china',
      };
    });

    const seller = await this.redis
      .send(
        {
          cmd: 'SELLER_ALL_INFO_BY_SELLERID',
        },
        sellerID,
      )
      .toPromise();

    return {
      seller: seller,
      newArrival: newArrivalFinalData,
      bestSellingProducts: {
        // ...product,
        data: finalProduct,
        totalCount: product.totalCount,
        totalPages: product.totalPages,
        currentPage: product.currentPage,
        from: product.from,
        to: product.totalCount,
        nextPage: product.nextPage,
      },
    };
  }

  async getSellerProfileProductBySellerID({
    pageNum,
    sellerID,
    minPrice,
    maxPrice,
    searchKey,
    sortBy,
  }): Promise<any> {
    const query: unknown = {};

    if (minPrice !== undefined && maxPrice === undefined) {
      query['priceStock.price'] = { $gte: parseInt(minPrice) };
    } else if (maxPrice !== undefined && minPrice === undefined) {
      query['priceStock.price'] = { $lte: parseInt(maxPrice) };
    } else if (minPrice !== undefined && maxPrice !== undefined) {
      query['priceStock.price'] = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice),
      };
    } else if (searchKey !== undefined) {
      query['productName'] = { $regex: '.*' + searchKey + '.*', $options: 'i' };
    }

    // ["BEST_SELLER","BEST_MATCH","PRICE_LOW_TO_HIGH","PRICE_HIGH_TO_LOW","HEIGHT_RATING","NEW_ARRIVAL"]
    let product;
    if (sortBy == 'BEST_MATCH') {
      product = await this.paginate<Product>(
        this.productModel.find({ sellerID }),
        pageNum,
      );
    } else if (sortBy == 'PRICE_LOW_TO_HIGH') {
      product = await this.paginate<Product>(
        this.productModel
          .find({ sellerID })
          .sort({ 'priceStock.price': 'asc' }),
        pageNum,
      );
    } else if (sortBy == 'PRICE_HIGH_TO_LOW') {
      product = await this.paginate<Product>(
        this.productModel.find({ sellerID }).sort({ 'priceStock.price': -1 }),
        pageNum,
      );
    } else if (sortBy == 'NEW_ARRIVAL') {
      product = await this.paginate<Product>(
        this.productModel.find({ sellerID }).sort({ productID: -1 }),
        pageNum,
      );
    } else {
      product = await this.paginate<Product>(
        this.productModel.find({ sellerID }),
        pageNum,
      );
    }

    const finalProduct = product.data.map((e) => {
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
          discountAmount: 10,
          discountPercentage: 10,
        },
        country: 'China',
      };
    });

    const seller = await this.redis
      .send(
        {
          cmd: 'SELLER_ALL_INFO_BY_SELLERID',
        },
        sellerID,
      )
      .toPromise();

    return {
      seller: seller,
      filters: [
        {
          options: [
            {
              value: 'bags-travel',
              title: 'Bags and Travel',
              url: '/bags-travel/',
              order: 0,
              id: '1902',
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
          options: [
            {
              value: 'Free Shipping',
              title: 'Free Shipping',
            },
            {
              value: 'Free Shipping',
              title: 'Free Shipping',
            },
          ],
          title: 'Discounts',
        },
        {
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
      ],
      product: {
        ...product,
        data: finalProduct,
        totalCount: product.totalCount,
        totalPages: product.totalPages,
        currentPage: product.currentPage,
        form: product.from,
        to: product.to,
        nextPage: product.nextPage,
      },
    };
  }

  async getSellerProductBySellerID(sellerID: string) {
    const product = await this.productModel
      .find({ sellerID: sellerID })
      .limit(3);

    return product.map((e) => {
      return {
        id: e.productID,
        name: e.productName,
        categoryID: '',
        sold: 20,
        rating: 0,
        imageUrl: e.image[0],
        altText: e.productName,
        price: {
          regular: e.priceStock[0].price,
          sale: e.priceStock[0].price,
          discountAmount: 23,
          discountPercentage: 2,
        },
      };
    });
  }

  // get product by object id
  async getProductByObjectID(objectID: string): Promise<any> {
    const product = await this.productModel.find({ _id: objectID });

    return product.map((e) => {
      return {
        id: e.productID,
        name: e.productName,
        categoryID: '',
        sold: 20,
        rating: 0,
        imageUrl: e.image[0],
        altText: e.productName,
        price: {
          regular: e.priceStock[0].price,
          sale: e.priceStock[0].price,
          discountAmount: 23,
          discountPercentage: 2,
        },
      };
    });
  }

  async single(id: number): Promise<any> {
    const data = await this.productModel.findOne({
      productID: id,
    });

    //seller
    const seller = await this.redis
      .send({ cmd: 'SELLER_ALL_INFO_BY_SELLERID' }, data.sellerID)
      .toPromise();

    // image map
    const imagePathList = data.priceStock.map((e) => {
      return {
        large: e.image,
        small: e.smallImage,
        alt: data.productName,
      };
    });

    // review
    const rating = await this.productReview.getProductReview(data.productID);

    const product = {
      imageModule: imagePathList,
      specsModule: data.specification,
      priceModule: {
        discount: 5,
        currentPrice: await this.getDiscountPrice(5, data.priceStock[0].price),
        oldPrice: data.priceStock[0].price,
        availQuantity: data.priceStock[0].quantity,
      },
      shippingModule: {
        company: 'Whirlpool',
        condition: 'Cash on delivery not available',
      },
      deliveryModule: {
        address: {
          name: 'Dhaka North - Middle Badda',
          value: '45403jsdnbuowrht03u',
          charge: 60,
        },
        duration: 'Usually delivered in 4-5 days to this area',
      },
      ratingModule: {
        ratingCount: 200,
        reviewCount: 23,
        rating: rating,
      },
      returnAndWarrentyModule: data.serviceDelivery,
      productModule: {
        _id: data._id,
        productName: data.productName,
        productID: data.productID,
        country: '',
        globalStock: 100,
        slug: data.productID,
        globalSKU: data.priceStock[0].globalSKU,
      },
      categoryModule: {
        categoryName: '',
        categoryID: data.categoryId,
        categoryTree: await this.getCategoryRoute(
          data.categoryId,
          data.productName,
        ),
      },
      mediaModule: {
        video: data.video,
      },
      descriptionModule: {
        highlights: data.highlights,
        longDescription: data.longDescription,
        englishDescription: data.englishDescription,
        whatInTheBox: data.whatInTheBox,
      },
      preSaleModule: {
        preSale: false,
      },
      skuModule: await this.getVarient(data.productID),
      sellerModule: {
        sellerID: data.sellerID,
        sellerName: seller.shop_name,
        country: '',
      },
      orderModule: {
        orderCount: 100,
      },
      brandModule: {
        brand: 'Apex',
        country: 'Bangladesh',
      },
      meta: {
        imagePath: data.image[0],
        keywords: data.productName,
        ogDescription: data.highlights,
        ogTitle: data.productName,
        slug: data.productID,
      },
    };

    return product;
  }

  async getVarient(productID: number) {
    const data = await this.productModel.findOne({
      productID: productID,
    });

    const arr = [];
    const unique = [];
    for (let index = 0; index < data.priceStock.length; index++) {
      const main = data.priceStock[index];
      // console.log(main.attribute);

      for (let index1 = 0; index1 < main.attribute.length; index1++) {
        const attr = main.attribute[index1];

        if (!unique.includes(Object.values(attr).toString())) {
          unique.push(Object.values(attr).toString());
          arr.push({
            index: index1,
            propertyName: Object.keys(attr).toString(),
            propertyValue: Object.values(attr).toString(),
            price: main.price,
            image: {
              large: main.image,
              small: main.smallImage,
            },
          });
        }
      }
    }
    // console.log(prI);

    const propertyname = [];
    const property = [];
    let pr = '';
    const pri = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      // console.log(element.index);
      // console.log(index);
      pri.push(element.index);

      pr = pr + ',' + index;
      if (!propertyname.includes(element.propertyName)) {
        propertyname.push(element.propertyName);

        property.push({
          index: index + '' + 1,
          propertyName: element.propertyName,
          propertyValue: [],
        });
      }
    }

    // console.log(property);
    // console.log(arr);

    let i = 0;
    let uniqueProperty = [];
    for (let index = 0; index < property.length; index++) {
      const element = property[index];

      for (let index1 = 0; index1 < arr.length; index1++) {
        const element1 = arr[index1];
        if (element.propertyName == element1.propertyName) {
          // check it is color then add image

          if (element.propertyName == 'color') {
            // property value push ( color : red, size: 41)
            element.propertyValue.push({
              index: i,
              propertyValue: element1.propertyValue,
              propertyDefinationName: element1.propertyValue,
              image: element1.image,
            });

            // push unique property
            uniqueProperty.push({
              index: i,
              propertyValue: element1.propertyValue,
            });
          } else {
            // push unique property
            uniqueProperty.push({
              index: i,
              propertyValue: element1.propertyValue,
            });

            // property value push ( color : red, size: 41)
            element.propertyValue.push({
              index: i,
              propertyValue: element1.propertyValue,
            });
          }
        }

        i = i + 1;
      }
    }

    // reverse uniqueproperty
    uniqueProperty = uniqueProperty.reverse();

    let priIndex = '';
    const indx = [];
    for (let index = 0; index < data.priceStock.length; index++) {
      const main = data.priceStock[index];

      for (let index1 = 0; index1 < main.attribute.length; index1++) {
        const element = main.attribute[index1];

        for (let index2 = 0; index2 < uniqueProperty.length; index2++) {
          const element1 = uniqueProperty[index2];
          console.log(element1.propertyValue);
          if (element1 != undefined) {
            if (element1.propertyValue == Object.values(element).toString()) {
              priIndex = element1.index + ',' + priIndex;
            }
          }
        }
      }

      // priceIndex reverse
      const str = priIndex.slice(0, -1);
      const chars = str.split(',');
      chars.reverse();

      indx.push({
        skuPropIds: chars.join(),
        globalSKU: main.globalSKU,
        skuVal: {
          discount: main.discount,
          currentPrice: await this.getDiscountPrice(5, main.price),
          oldPrice: main.price,
          availQuantity: main.quantity,
        },
      });
      priIndex = '';
    }

    // console.log(property);

    return { skuPriceList: indx, productSKUPropertyList: property };
  }

  async getVarientBySKU(globalSKU: string, productID: number) {
    // let varient;

    const product = await this.productModel.findOne({
      productID: productID,
    });

    const varientData = product.priceStock.filter(
      (e) => e.globalSKU == globalSKU,
    );

    const attribute = [];

    const arr = [];
    let unique = [];
    for (let index = 0; index < varientData.length; index++) {
      const main = varientData[index];
      // console.log(main.attribute);

      for (let index1 = 0; index1 < main.attribute.length; index1++) {
        const attr = main.attribute[index1];

        if (!unique.includes(Object.values(attr).toString())) {
          unique.push(Object.values(attr).toString());
          arr.push({
            index: index1,
            propertyName: Object.keys(attr).toString(),
            propertyValue: Object.values(attr).toString(),
            price: main.price,
            image: {
              large: main.image,
              small: main.smallImage,
            },
          });
        }
      }
    }
    // console.log(prI);

    const propertyname = [];
    const property = [];
    let pr = '';
    let pri = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      // console.log(element.index);
      // console.log(index);
      pri.push(element.index);

      pr = pr + ',' + index;
      if (!propertyname.includes(element.propertyName)) {
        propertyname.push(element.propertyName);

        property.push({
          index: index + '' + 1,
          propertyName: element.propertyName,
          propertyValue: [],
        });
      }
    }

    // console.log(property);
    // console.log(arr);

    const price = [];
    let i = 0;
    let uniqueProperty = [];
    for (let index = 0; index < property.length; index++) {
      const element = property[index];

      for (let index1 = 0; index1 < arr.length; index1++) {
        const element1 = arr[index1];
        if (element.propertyName == element1.propertyName) {
          // check it is color then add image

          if (element.propertyName == 'color') {
            // property value push ( color : red, size: 41)
            element.propertyValue.push({
              index: i,
              propertyValue: element1.propertyValue,
              propertyDefinationName: element1.propertyValue,
              image: element1.image,
            });

            // push unique property
            uniqueProperty.push({
              index: i,
              propertyValue: element1.propertyValue,
            });
          } else {
            // push unique property
            uniqueProperty.push({
              index: i,
              propertyValue: element1.propertyValue,
            });

            // property value push ( color : red, size: 41)
            element.propertyValue.push({
              index: i,
              propertyValue: element1.propertyValue,
            });
          }
        }

        i = i + 1;
      }
    }

    // reverse uniqueproperty
    uniqueProperty = uniqueProperty.reverse();

    let priIndex = '';
    const indx = [];
    for (let index = 0; index < varientData.length; index++) {
      const main = varientData[index];

      for (let index1 = 0; index1 < main.attribute.length; index1++) {
        const element = main.attribute[index1];

        for (let index2 = 0; index2 < uniqueProperty.length; index2++) {
          const element1 = uniqueProperty[index2];
          console.log(element1.propertyValue);
          if (element1 != undefined) {
            if (element1.propertyValue == Object.values(element).toString()) {
              priIndex = element1.index + ',' + priIndex;
            }
          }
        }
      }

      let str = priIndex.slice(0, -1);
      let chars = str.split(',');
      chars.reverse();

      indx.push({
        skuPropIds: chars.join(),
        globalSKU: main.globalSKU,
        skuVal: {
          discount: main.discount,
          currentPrice: await this.getDiscountPrice(5, main.price),
          oldPrice: main.price,
          availQuantity: main.quantity,
        },
      });
      priIndex = '';
    }
    console.log('hit');

    if (property.length == 0) {
      return {
        skuPriceList: indx,
        productSKUPropertyList: property,
        global: {
          smallImage: varientData[0].smallImage,
          globalSKU: varientData[0].globalSKU,
          globalStock: varientData[0].quantity,
        },
      };
    } else {
      return { skuPriceList: indx, productSKUPropertyList: property };
    }
    // console.log(property);
  }
}
