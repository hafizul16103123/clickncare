import { modelOptions, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

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
    collection: 'pending-prices',
  },
})
export class PendingPrice extends TimeStamps {
  
  @prop()
  productID: number;

  @prop()
  globalSKU: string;

  @prop()
  sellerSKU: string;

  @prop()
  price: number;

  @prop()
  status: string;
}
