import { Prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Schema } from 'mongoose';
import { Category } from 'src/category/entities/category.entity';

export class ProductSpecification {
  @Prop()
  key: string;

  @Prop()
  value: string;
}

export class ServiceDelivery {
  @Prop()
  warrentyType?: string;

  @Prop()
  warrentyPeriod?: string;

  @Prop()
  warrentyPolicy?: string;

  @Prop()
  packageWeight?: string;

  @Prop()
  packageDimentions?: string;

  @Prop()
  dangerousGood?: string;
}

export class PriceStock {
  @Prop()
  availability: string;

  @Prop()
  color: string;

  @Prop()
  size: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  @Prop()
  image: string;

  @Prop()
  smallImage: string;

  @Prop()
  sellerSKU: string;

  @Prop()
  globalSKU: string;

  @Prop()
  freeItems: string;
}

export class Product extends TimeStamps {
  @Prop()
  productID: number;

  @Prop()
  sellerID: string;

  @Prop()
  productName: string;

  @Prop({
    ref: 'Category',
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  })
  categoryId: Ref<Category>;

  @Prop()
  varient: any;

  @Prop()
  video: string;

  @Prop()
  highlights: string;

  @Prop()
  longDescription: string;

  @Prop()
  englishDescription: string;

  @Prop()
  whatInTheBox: string;

  @Prop()
  image: any[];

  @Prop()
  specification: ProductSpecification[];

  @Prop()
  serviceDelivery: ServiceDelivery;

  @Prop()
  priceStock: PriceStock[];

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  size: any[];

  @Prop()
  color: any[];
}
