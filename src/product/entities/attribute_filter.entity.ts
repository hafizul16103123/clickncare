import { Prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
 
export class Attribute_Filter extends TimeStamps {

    @Prop()
    categoryId: number;

    @Prop()
    sellerId: string;
  
    @Prop()
    data: Record<string,any>;

}