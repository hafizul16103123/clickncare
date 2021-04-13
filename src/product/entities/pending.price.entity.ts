import { prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class PendingPrice extends TimeStamps {
  @prop()
  z_id: string;

  @prop()
  productID: string;

  @prop()
  globalSKU: string;

  @prop()
  sellerSKU: string;

  @prop()
  price: string;

  @prop()
  status: string;
}
