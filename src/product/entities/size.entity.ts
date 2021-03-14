import { modelOptions, prop, Ref } from '@typegoose/typegoose';
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
    collection: 'sellerSizes',
  },
})
export class SellerSize extends TimeStamps {
  @prop()
  sellerID: string;

  @prop()
  size: string;
}
