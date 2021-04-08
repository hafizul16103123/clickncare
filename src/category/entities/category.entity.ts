import { prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Category extends TimeStamps {
  @prop()
  categoryId: number;

  @prop()
  categoryName: string;

  @prop()
  parentId: number;

  @prop()
  image: string;

  @prop()
  dCategoryId: string;

  @prop()
  leaf: string;

}
