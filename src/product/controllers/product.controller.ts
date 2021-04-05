import { UpdateProductDto } from './../dto/update-product.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { IPaginatedData } from 'src/utils/paginate';
import csv from 'csv-parser';
import { User } from 'src/auth/user/user.decorator';
import { UserGuard } from 'src/auth/user/user.guard';
import { UserOptionalGuard } from 'src/auth/user/user.optional.guard';
const http = require('https');
import fetch from 'node-fetch';
import * as fs from 'fs';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

// const csv = require('csv-parser');
// const fs = require('fs');

@ApiTags('Product Related Operations')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,

    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
  ) {}

  @Post()
  async addProduct(@Body() data: CreateProductDto, @User() z_id: string) {
    return this.productService.addProduct(data, z_id);
  }

  @Get()
  async getProducts(
    @Query('page') page: string,
  ): Promise<IPaginatedData<Product[]>> {
    return this.productService.getAllProducts(parseInt(page));
  }

  // only 1, 2, 3 will work
  @Get('single')
  async getProduct(@Query('productId') id: number): Promise<Product> {
    return this.productService.single(id);
  }

  // @Put('update-product/:productId')
  // async updateProduct(
  //   @Param('productId') id: string,
  //   @Body() updateProductDto: UpdateProductDto,
  // ): Promise<Product> {
  //   const data = this.productService.updateProductInfo(+id, updateProductDto);
  //   return data;
  // }

  @Post('/save-daraz-product')
  async saveDarazProduct(@Body() data: any) {
    return this.productService.saveDarazProduct(
      data,
      '6018ed070557325fb13790b3',
    );
  }

  // product import
  @Post('product-import')
  async productImport() {
    // console.log(fs.readFileSync('src/data.csv', 'utf8'));

    fs.createReadStream('src/data.csv', 'utf8')
      .on('data', (row) => {
        const m = row.toString().replace(/<[^>]*>?/gm, '');
        console.log(m);

        console.log(JSON.parse(m));
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
  }

  @Get('/test')
  async single2(@Query('productID') productID: number) {
    return this.aliexpressProduct(productID);
    // return this.requestStore(4059002, 244102909, 1);
  }

  async requestStore(store, seller, page) {
    //25617c8160mshdefb02a4126cb4ep106eb2jsn5d89e238746b
    const data = await fetch(
      `https://magic-aliexpress1.p.rapidapi.com/api/store/${store}/seller/${seller}/products?page=${page}`,
      {
        headers: {
          'x-rapidapi-key':
            '6b1cf5c3afmsh229619ba0408ba0p10a397jsnd0d36a678811',
          'x-rapidapi-host': 'magic-aliexpress1.p.rapidapi.com',
        },
      },
    ).then((r) => r.json());
    console.log(data);

    data.docs.map((e) => {
      this.aliexpressProduct(e.product_id);
    });

    return data;
  }

  async aliexpressProduct(product_id) {
    const data = await fetch(
      `https://magic-aliexpress1.p.rapidapi.com/api/product/${product_id}`,
      {
        headers: {
          'x-rapidapi-key':
            '6b1cf5c3afmsh229619ba0408ba0p10a397jsnd0d36a678811',
          'x-rapidapi-host': 'magic-aliexpress1.p.rapidapi.com',
        },
      },
    ).then((r) => r.json());

    const lastProduct = await this.productModel
      .findOne()
      .sort({ _id: -1 })
      .limit(1);
    if (lastProduct === null) {
      data.productID = 1;
    } else {
      data.productID = lastProduct.productID + 1;
    }

    const specification = data.specs.map((e) => {
      return {
        key: e.attrName,
        value: e.attrValue,
      };
    });

    const priceStock = data.metadata.skuModule.productSKUPropertyList.map(
      (e) => {
        return e.skuPropertyValues.map((m) => {
          // return {
          //   [`${e.skuPropertyName}`]: m.propertyValueDisplayName,
          // };
        });
        // { [`${e.skuPropertyName}`]: '1' };
      },
    );

    return {
      1: data.metadata.skuModule.productSKUPropertyList,
      2: data.metadata.skuModule.skuPriceList,
    };

    const image = data.metadata.imageModule.imagePathList;
    const status = 'live';
    const productName = data.metadata.titleModule.product_title;

    const longDescription = await fetch(
      data.metadata.descriptionModule.descriptionUrl,
    ).then((r) => r.text());
    const englishDescription = longDescription;
    const highlights = data.metadata.titleModule.description;
    const whatInTheBox = '';

    const packingInfo = await this.packingInfo(product_id);
    const serviceDelivery = {
      warrentyType: '',
      warrentyPeriod: '',
      warrentyPolicy: 'string',
      packageWeight: {
        weight: packingInfo.packageInfo.weight,
        weightType: 'cm',
      },
      packageDimentions: {
        length: packingInfo.packageInfo.length,
        width: packingInfo.packageInfo.width,
        height: packingInfo.packageInfo.height,
        dimentionType: 'cm',
      },
      dangerousGood: 'no',
    };
    const sellerID = '';
    const productID = lastProduct;
    return '';
  }

  async packingInfo(productID) {
    return await fetch(
      'https://magic-aliexpress1.p.rapidapi.com/api/shipping/' + productID,
      {
        headers: {
          'x-rapidapi-key':
            '6b1cf5c3afmsh229619ba0408ba0p10a397jsnd0d36a678811',
          'x-rapidapi-host': 'magic-aliexpress1.p.rapidapi.com',
        },
      },
    ).then((r) => r.json());
  }
}
