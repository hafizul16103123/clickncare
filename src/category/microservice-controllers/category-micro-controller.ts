import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CategoryService } from '../category.service';

@Controller()
export class CategoryMicroServiceController {
  constructor(private readonly categoryService: CategoryService) {}

  // @MessagePattern({ cmd: 'CATEGORY_GET_MAIN' })
  // async getMainCategory(): Promise<any> {
  //   return this.categoryService.mainCategory();
  // }

  // @MessagePattern({ cmd: 'CATEGORY_GET_UNDERCATEGORY' })
  // async underCategory(category_id: string, parent_id: string): Promise<any> {
  //   return this.categoryService.underCategory(category_id, parent_id);
  // }

  // @MessagePattern({ cmd: 'CATEGORY_GET_ATTRIBUTE_BY_ID' })
  // async attribute(category_id: number): Promise<any> {
  //   return this.categoryService.attributeById(category_id);
  // }

  @MessagePattern({ cmd: 'SELLER_GET_CATEGORY_BY_ID' })
  async attribute(categoryId): Promise<any> {
    // Get Category by ObjectID
    return this.categoryService.getCategory(categoryId);
  }
}
