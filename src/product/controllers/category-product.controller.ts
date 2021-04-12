import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Attribute_FilterDTO } from '../dto/attribute_filter.dto';
import { Product } from '../entities/product.entity';
import { CategoryProductService } from '../services/category-product.service';

@ApiTags('Category Related Operations')
@Controller('products')
export class ProductCategoryController {
  constructor(private readonly categorProductService: CategoryProductService) {}
  // Get products by Category
  // @ApiQuery({ name: 'id', example: '601236f7953448206c22496e', required: true })
  // @ApiQuery({ name: 'color', example: 'red', required: false })
  // @ApiQuery({ name: 'size', example: '10', required: false })
  // @ApiQuery({ name: 'minPrice', example: 100, required: false })
  // @ApiQuery({ name: 'maxPrice', example: 200, required: false })
  // @ApiQuery({ name: 'page', example: 1, required: false })
  // @Get('category')
  // async productsByCategory(
  //   @Query('id') id: string,
  //   @Query('color') color: string,
  //   @Query('size') size: string,
  //   @Query('minPrice') minPrice: string,
  //   @Query('maxPrice') maxPrice: string,
  //   @Query('page') page: string,
  // ): Promise<Product[] | null> {
  //   return this.categorProductService.productsByCategory(
  //     id,
  //     color,
  //     size,
  //     minPrice,
  //     maxPrice,
  //     +page,
  //   );
  // }

  // body  example: [{
  //          "key": "brand",
  //           "value": "Choroi Express"
  //      },
  //      {
  //          "key": "color_family",
  //          "value": "Red"
  //      }
  // ]

  @Post('createAttribute')
  @ApiQuery({ name: 'categoryId', type: Number })
  @ApiQuery({ name: 'sellerId', type: String })
  async createAttribute(
    @Query('categoryId') categoryId: number,
    @Query('sellerId') sellerId: string,
    @Body() data: Attribute_FilterDTO,
  ) {
    return await this.categorProductService.createAttribute(
      categoryId,
      sellerId,
      data,
    );
  }

  // body example: {
  //     "brand": "Choroi Express",
  //     "color_family": "Sliver"
  //  }

  @Post('getCategoryLeftFilter')
  @ApiQuery({ name: 'categoryId', type: Number })
  async getCategoryLeftFilter(
    @Query('categoryId') categoryId: number,
    @Body() data: Attribute_FilterDTO,
  ) {
    return await this.categorProductService.getCategoryLeftFilter(
      categoryId,
      data,
    );
  }

  
  @Post('getStoreLeftFilter')
  @ApiQuery({name: 'sellerId',  type: String})
 //  example: {
 //     "brand": "Choroi Express",
 //     "color_family": "Sliver"
 //  }
  async getStoreLeftFilter(@Query("sellerId") sellerId: string, @Body() data: Attribute_FilterDTO) {         
      return await this.categorProductService.getStoreLeftFilter(sellerId, data);
  }

  @Post('getSearchLeftFilter')
	@ApiQuery({name: 'keyword',  type: String})
	//  example: {
	//     "brand": "Choroi Express",
	//     "color_family": "Sliver"
	//  }
	async getSearchLeftFilter(@Query("keyword") keyword: string) {         
		return await this.categorProductService.getSearchLeftFilter(keyword);
	}



}
