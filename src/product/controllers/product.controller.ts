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
import * as fs from 'fs';
import { User } from 'src/auth/user/user.decorator';
import { UserGuard } from 'src/auth/user/user.guard';
import { UserOptionalGuard } from 'src/auth/user/user.optional.guard';
const http = require('https');
import fetch from 'node-fetch';
// import fs from fs;
// const csv = require('csv-parser');
// const fs = require('fs');

@ApiTags('Product Related Operations')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
    return this.requestStore(4059002, 244102909, 1);
  }

  async requestStore(store, seller, page) {
    const data = [];

    // const options = {
    //   method: 'GET',
    //   hostname: 'magic-aliexpress1.p.rapidapi.com',
    //   port: null,
    //   path:
    //     '/api/store/' +
    //     store +
    //     '/seller/' +
    //     seller +
    //     '/products?page=' +
    //     page +
    //     '',
    //   headers: {
    //     'x-rapidapi-key': '25617c8160mshdefb02a4126cb4ep106eb2jsn5d89e238746b',
    //     'x-rapidapi-host': 'magic-aliexpress1.p.rapidapi.com',
    //     useQueryString: true,
    //   },
    // };

    return await fetch(
      'https://magic-aliexpress1.p.rapidapi.com/api/store/4059002/seller/244102909/products?page=1',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-key':
            '25617c8160mshdefb02a4126cb4ep106eb2jsn5d89e238746b',
          'x-rapidapi-host': 'magic-aliexpress1.p.rapidapi.com',
        },
      },
    ).then((r) => (r.json() ? r.text() : 'p'));
  }

  async aliexpressProduct() {}
}
