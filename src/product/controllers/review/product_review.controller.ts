import { Body, Controller, Get, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import fs from 'fs';

import { editFileName, imageFileFilter } from 'src/imageUpload/imageUpload.service';
import { ProductReviewDto } from 'src/product/dto/review/product_review.dto';
import { ProductReviewService } from 'src/product/services/review/product_review.service';

@ApiTags('Product Detail')
@Controller('product_detail')
export class ProductReviewController {
  constructor(private readonly productReview: ProductReviewService) { }

  @Post('add_review')
  async createProductReview(@Body() data: ProductReviewDto) {
    return await this.productReview.createProductReview(data);
  }

  @Get('get_review')
  @ApiQuery({ name: 'productId', type: Number })
  async getProductReview(@Query('productId') productId: number) {
    return await this.productReview.getProductReview(productId);
  }
  // @Post('single-image')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './files',
  //       filename: editFileName,
  //     }),
  //     fileFilter: imageFileFilter,
  //   }),
  // )
  // async uploadedFile(@UploadedFile() file) {
  //   console.log(file)
  //   const response = {
  //     originalname: file.originalname,
  //     filename: file.filename,
  //   };
  //   return response;
  // }

  @Post('multiple-image')
  @UseInterceptors(
    FilesInterceptor('image', 20, {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )

  async uploadMultipleFiles(@UploadedFiles() files,@Body() body) {
    return await this.productReview.uploadImage(files, body);
    
  }


}
