import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductReviewDto } from 'src/product/dto/review/product_review.dto';
import { ProductReviewService } from 'src/product/services/review/product_review.service';

@ApiTags('Product Detail')
@Controller('product_detail')
export class ProductReviewController {
  constructor(private readonly productReview: ProductReviewService) {}

  @Post('add_review')
  async createProductReview(@Body() data: ProductReviewDto) {
    return await this.productReview.createProductReview(data);
  }

  @Get('get_review')
  @ApiQuery({ name: 'productId', type: Number })
  async getProductReview(@Query('productId') productId: number) {
    return await this.productReview.getProductReview(productId);
  }
}
