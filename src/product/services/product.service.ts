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

    data.varient = {
      color: color,
      size: {
        ...(sizeTypeExist && { sizeType: data.sizeType }),
        size,
      },
      price: price,
      skuBase: { color: cl, size: sz },
    };

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

  async saveDarazProduct(data: any, z_id: string): Promise<any> {
    console.log(data);
    data.categoryId = new mongoose.Types.ObjectId('5e997f95d6a35f3a0def3339');
    return await this.productModel.create(data);
  }

  // microservice
  async getStoreHomepage({ sellerID, pageNum }): Promise<any> {
    const product = await this.paginate<Product>(
      this.productModel.find({ sellerID }),
      pageNum,
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
        ...product,
        data: finalProduct,
        totalCount: product.totalCount,
        totalPages: product.totalPages,
        currentPage: product.currentPage,
        from: product.form,
        to: product.totalCount,
        nextPage: product.nextPage,
      },
    };
  }
  async getSellerProfileProductBySellerID({ sellerID, pageNum }): Promise<any> {
    const product = await this.paginate<Product>(
      this.productModel.find({ sellerID }),
      pageNum,
    );

    const finalProduct = product.data.map((e) => {
      return {
        // id: e.productID,
        // image: e.image[0],
        // alt: e.highlights,
        // title: e.productName,
        // price: e.priceStock[0].price,
        // discountPrice: 0,
        // discountPercentage: 0,

        ///
        id: e.productID,
        name: 'Test product',
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

    return {
      seller: seller,
      filters: filters,
      product: {
        ...product,
        data: finalProduct,
        totalCount: product.totalCount,
        totalPages: product.totalPages,
        currentPage: product.currentPage,
        form: product.form,
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

  async single2(id: number): Promise<any> {
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

  async getVarient(productID: number) {
    const data = await this.productModel.findOne({
      productID: productID,
    });

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

    const color = [];
    const size = [];
    const price = [];

    for (let index = 0; index < data.priceStock.length; index++) {
      const main = data.priceStock[index];

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

    const varient = {
      color: color,
      size: size,
      price: price,
      skuBase: { color: cl, size: sz },
    };

    return varient;
  }

  async getVarientBySKU(globalSKU: string, productID: number) {
    const data = await this.productModel.findOne({
      productID: productID
    });
   const varientData = data.priceStock.filter(e=> e.globalSKU == globalSKU);
   
  // return varientData;
  
    let cl = [];
    data.color.forEach((e, index) => {
      if(varientData[0].color == e){
        cl.push({ propertyValueId: index,
          propertyName: e,
          image: {
            large: '',
            small: '',
          }
        });
      }
    });

    let sz = [];
    data.size.forEach((e, index) => {
      if(varientData[0].size == e){
        sz.push({
          propertyValueId: index,
          propertyName: e,
        });
      }
    });

    const color = [];
    const size = [];
    const price = [];

    for (let index = 0; index < data.priceStock.length; index++) {
      const main = data.priceStock[index];

      if(main.globalSKU == globalSKU){

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

      
    }

    const varient = {
      color: color,
      size: size,
      price: price,
      skuBase: { color: cl, size: sz },
    };

    return varient;
  }

  


}
