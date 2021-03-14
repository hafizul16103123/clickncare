import { modelOptions, Prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Schema } from 'mongoose';
import { Product } from './product.entity';
@modelOptions({
  schemaOptions: {
    autoIndex: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    collection: 'carts',
  },
})
export class Cart extends TimeStamps {
  @Prop({ required: true })
  z_id: string;

  @Prop({ type: Schema.Types.ObjectId, required: true, ref: Product })
  productID: Ref<Product>;

  @Prop({ required: true, type: String })
  sellerID: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  image: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Object })
  attribute: Object;

  @Prop({ required: false, type: String })
  shippingMethod?: string;

  @Prop({ required: false, type: Number })
  shippingCharge?: number;

  @Prop({ required: true, type: Date })
  date: Date;
}
