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
    collection: 'sellerCountries',
  },
})
export class SellerCountry extends TimeStamps {
  @prop()
  sellerID: string;

  @prop()
  country: string;
}
