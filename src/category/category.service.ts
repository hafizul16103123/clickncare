import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { Attribute } from './entities/attribute.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Attribute)
    private readonly attributeModel: ReturnModelType<typeof Attribute>,
  ) {}

  async category(parent_id: number): Promise<any> {
    const data = await this.categoryModel.find({ parentId: parent_id }).exec();

    return data;
  }

  async importAttribute(category_id: number, data: any): Promise<any> {
    const category = await this.categoryModel
      .findOne({ categoryId: category_id })
      .exec();

    await this.attributeModel.create({
      categoryId: category_id,
      attribute: data,
      name: category.categoryName,
      response: [],
      data: [],
    });

    return data;
  }

  async showList(category_id: number): Promise<any> {
    return await this.attributeModel
      .find({ categoryId: category_id })
      .select('name');
  }

  async getCategory(category_id: string): Promise<any> {
    const data = await this.categoryModel.findOne({ _id: category_id }).exec();
    return data;
  }

  async getAttributeByCategoryId(id: number): Promise<any> {
    const attrDtl = await this.attributeModel.find({ categoryId: id });
<<<<<<< HEAD
    return attrDtl;
=======

    const attr = attrDtl[0].attribute.data.filter((e) => e.required == true);
    let attribute = [];

    attr.map((p) => {
      const attrItems = {
        attributeName: p.label,
        uiType: p.uiType,
        placeholder: p.placeholder,
        attributeValues: p.dataSource,
      };

      attribute.push(attrItems);
    });

    return attribute;
>>>>>>> c2356b060496cdee75b5b619005ce28ad8599cdc
  }
}
