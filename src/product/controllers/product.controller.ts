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
  @UseGuards(UserGuard)
  @Get('single')
  async getProduct(
    @Query('productId') id: number,
    @User() user: string,
  ): Promise<Product> {
    console.log('user1 ' + user);

    return this.productService.getSingleProduct(id);
  }

  @Put('update-product/:productId')
  async updateProduct(
    @Param('productId') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const data = this.productService.updateProductInfo(+id, updateProductDto);
    return data;
  }

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

  @Get('/single2:productID')
  async single2(@Query('productID') productID: number) {
    return this.productService.single2(productID);
  }
}
