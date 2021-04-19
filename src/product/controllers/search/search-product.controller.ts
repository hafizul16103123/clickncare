import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Product } from '../../entities/product.entity';


import { SearchProductService } from '../../services/search/search-product.service';
import { IPaginatedData } from 'src/utils/paginate';

@ApiTags('Product Related Operations')
@Controller('products')
export class SearchProductController {
  constructor(private readonly searchProductService: SearchProductService) {}

  @ApiQuery({ name: 'key', example: 'bag' })
  @ApiQuery({ name: 'color', example: 'red', required: false })
  @ApiQuery({ name: 'size', example: '10', required: false })
  @ApiQuery({ name: 'minPrice', example: 100, required: false })
  @ApiQuery({ name: 'maxPrice', example: 200, required: false })
  @ApiQuery({ name: 'page', example: 1, required: false })
  @Get('search')
  async search(
    @Query('key') key: string,
    @Query('color') color: string,
    @Query('size') size: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
    @Query('page') page: string,
  ): Promise<Product[] | null> {
    return this.searchProductService.search(
      key,
      color,
      size,
      minPrice,
      maxPrice,
      +page,
    );
  }

  @ApiQuery({
    name: 'product_id',
    example: '1',
    required: true,
  })
  @Get('recommended')
  async recommendedProducts(
    @Query('product_id') product_id: number,
  ): Promise<Product[] | null> {
    return this.searchProductService.recommendedProducts(product_id);
  }

  @Get('products-by-sellerID')
  async ProductsBySellerId(
    @Query('page') page: string,
    @Query('sellerID') id: string,
  ): Promise<IPaginatedData<Product[]>> {
    return await this.searchProductService.getProductsBySellerId(+page, id);
  }

  @Get('search-suggession')
  async suggession(@Query('text') text: string): Promise<any> {
    return await this.searchProductService.suggession(text);
  }
}
