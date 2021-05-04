import { Body, Controller, Get, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
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

    @Post('image-upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
  	  schema: {
  		  type: 'object',
  		  properties: {
  			  file: {
  				  type: 'string',
  				  format: 'binary',
  			  },
  		  },
  	  },
    })
    @UseInterceptors(FileInterceptor('file'))

    async uploadImage(@UploadedFile() files): Promise<any> {
  	  console.log('file')
  	  console.log(files)
  	  return this.productReview.uploadImage(files);
    }


}
