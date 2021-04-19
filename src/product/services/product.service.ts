import { CategoryProductService } from './category-product.service';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { IPaginatedData, paginate } from 'src/utils/paginate';
import { CreateProductDto, PriceStockDTO } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PriceStock, Product } from '../entities/product.entity';
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
import { CategoryService } from 'src/category/category.service';
import { PendingPrice } from '../entities/pending.price.entity';
import { PendingPriceDTO, PriceUpdate } from '../dto/pending.price.dto';
import { find } from 'rxjs/operators';

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

    @InjectModel(PendingPrice)
    private readonly pendingPriceModel: ReturnModelType<typeof PendingPrice>,

    private readonly productReview: ProductReviewService,

    private readonly categoryProductService: CategoryProductService,
  ) {}

  private paginate = paginate;

  async addProduct(data: CreateProductDto, z_id: string): Promise<any> {
    const sellerID = 'ZDSEL1613990069';
    data.sellerID = sellerID;

    const lastProduct = await this.productModel
      .findOne()
      .sort({ _id: -1 })
      .limit(1);
    let productID;
    if (lastProduct === null) {
      productID = 1;
      data.productID = 1;
    } else {
      productID = lastProduct.productID + 1;
      data.productID = productID;
    }

    const priceStock = data.priceStock.map((e) => {
      // attribute array to string
      console.log('attr :', e.attribute);
      const attr = e.attribute
        .map((e) => {
          return Object.values(e);
        })
        .toString();

      // replace coma
      const regex = /,/gi;
      const attrValue = attr.replace(regex, '');

      return {
        availability: 'yes',
        price: e.price,
        attribute: e.attribute,
        discount: e.discount,
        quantity: e.quantity,
        image: e.image,
        smallImage: e.smallImage,
        sellerSKU: e.sellerSKU,
        globalSKU: sellerID + '' + productID + '' + attrValue,
      };
    });

    // price stock
    data.priceStock = priceStock;

    console.log(data.priceStock);

    const specification = data.specification;
    this.categoryProductService.createAttribute(
      data.categoryId,
      data.sellerID,
      specification,
    );

    const savedProduct = await this.productModel.create(data);

    return savedProduct;
  }

  // update product
  async updatePrice(data: PriceUpdate, z_id: string): Promise<any> {
    // data.z_id = '';   
    // const seller = await this.redis
    //   .send({ cmd: 'FIND_SELLERID_BY_Z_ID' }, '606048857bdfe933d4416af4')
    //   .toPromise();
  
    // const sellerID = seller.sellerID;

    const product = await this.productModel.find({
      // sellerID: sellerID,
      sellerID: 'ZDSEL1616922757',
      productID: data.productID,
    });     
  

    if (product.length == 0){
      return 'You dont have access to update this product';
    }
    let dataReturn;
    
    for (let index = 0; index < data.data.length; index++) {
      const element = data.data[index];
      const price = await this.pendingPriceModel.find({
        globalSKU: element.globalSKU,
        status: 'pending',
      });

      if (price == null) {
        const price = await this.pendingPriceModel.create();
      }                                              
      const quantityQuery = { "priceStock.globalSKU": element.globalSKU,  productID: data.productID };
      const updateQuery = { $set: { "priceStock.quantity": parseInt(element.quantity)} }
      dataReturn = await this.productModel.updateOne(quantityQuery,updateQuery);                      
    }

    return dataReturn;
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
      query['productName'] = { $regex: '.*' + searchKey + '.*' };
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
