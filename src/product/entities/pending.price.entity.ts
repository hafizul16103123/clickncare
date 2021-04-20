import { prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class PendingPrice extends TimeStamps {
  @prop()
  sellerID: string;

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
