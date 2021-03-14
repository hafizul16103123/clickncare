import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { AttributeData } from './dto/create-category.dto';
import * as fs from 'fs';
import { InjectModel } from 'nestjs-typegoose';
import { Category } from './entities/category.entity';
import { ReturnModelType } from '@typegoose/typegoose';
import { Attribute } from './entities/attribute.entity';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Attribute)
    private readonly attributeModel: ReturnModelType<typeof Attribute>,
  ) {}

  @ApiTags('All category Example parent id 0')
  @Get('category/:parent_id')
  async mainCategory(@Query('parent_id') parent_id: number) {
    return this.categoryService.category(parent_id);
  }

  @ApiTags('Attribute store')
  @Post('attribute/:category_id')
  async importAttribute(
    @Body() data: AttributeData,
    @Query('category_id') category_id: number,
  ) {
    return this.categoryService.importAttribute(category_id, data);
  }

  @ApiTags('Show submitted attribute')
  @Post('attribute-list/:category_id')
  async showList(@Query('category_id') category_id: number) {
    return this.categoryService.showList(category_id);
  }

  @ApiTags('Test')
  @Get('test')
  async test() {
    // const read = fs.readFileSync('src/category/attribute');
    // fs.readdirSync('./attribute');
    const fileName = fs.readdirSync('src/category/attribute/out');
    fileName.map(async (e) => {
      const read = fs
        .readFileSync('src/category/attribute/out/' + e)
        .toString();
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

      if (attribute == null) {
        await this.attributeModel.create({
          categoryId: dataBaseCat.categoryId,
          attribute: data.data[7].dataSource,
          name: dataBaseCat.categoryName,
        });
      }
    });
  }
}
