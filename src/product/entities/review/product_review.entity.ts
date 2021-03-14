import { Prop } from '@typegoose/typegoose';

export class ProductReview {
  @Prop()
  customer_id: number;

  @Prop()
  customer_name: string;

  @Prop()
  product_id: number;

  @Prop()
  rating: number;

  @Prop()
  review: string;
}
