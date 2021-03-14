import { Prop, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class DeliveryLocation extends TimeStamps {
  @Prop()
  region: string;

  @Prop()
  cityID: string;

  @Prop()
  cityName: string;

  @Prop()
  id: string;

  @Prop()
  area: string;

  @Prop()
  eCourier: string;

  @Prop()
  sundarban: string;

  @Prop()
  minhaz: string;

  @Prop()
  gogo: string;

  @Prop()
  charge: number;
}
