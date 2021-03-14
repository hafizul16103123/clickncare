import { Prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Attribute extends TimeStamps {
  @Prop()
  categoryId: number;

  @Prop()
  attribute: any;

  @Prop()
  name: string;
}
