import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AttributeData } from './dto/create-category.dto';
import * as fs from 'fs';
import { InjectModel } from 'nestjs-typegoose';
import { Category } from './entities/category.entity';
import { ReturnModelType } from '@typegoose/typegoose';
import { Attribute } from './entities/attribute.entity';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Attribute)
    private readonly attributeModel: ReturnModelType<typeof Attribute>,
  ) {}

  @ApiTags('All category input parent id (Example 1)')
  @Get('')
  async mainCategory(@Query('parent_id') parent_id: number) {
    console.log('category');

    return this.categoryService.category(parent_id);
  }

  @ApiTags('Get Category Attribute')
  @ApiQuery({ name: 'categoryId' })
  @Get('getAttribute')
  async attribute(@Query('categoryId') category_id: number): Promise<any> {
    return this.categoryService.getAttributeByCategoryId(category_id);
  }

  @ApiTags('Test')
  @Get('test')
  async test() {
    // const read = fs.readFileSync('src/category/attribute');
    // fs.readdirSync('./attribute');
    const fileName = fs.readdirSync('src/category/out');
    fileName.map(async (e) => {
      const read = fs.readFileSync('src/category/out/' + e).toString();
      const data = JSON.parse(read);
      // console.log(data.data[7].dataSource);

      const f = e.replace(/\-/g, ' ');
      const categoryName = f.replace(/\.json/g, '');
      const dataBaseCat = await this.categoryModel.findOne({
        categoryName: categoryName,
      });

      const attribute = await this.attributeModel.findOne({
        categoryId: dataBaseCat.categoryId,
      });

      if (attribute != null) {
        const attr = [];
        for (let index = 0; index < data.data.length; index++) {
          const element = data.data[index];
          if (element.group == 'sale') {
            attr.push(element);
          }
        }

        attribute.response = attr;

        attribute.save();
      }
    });
  }
}
