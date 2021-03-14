import { modelOptions, Prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Name {
  @Prop({ required: true, type: String })
  en: string;

  @Prop({ type: String })
  bn?: string;
}

export class City {
  @Prop({ required: true })
  name: Name;

  @Prop({ required: true })
  zones: Name[];
}

@modelOptions({
  schemaOptions: { collection: 'region_list', timestamps: true },
})
export class RegionModel extends TimeStamps {
  @Prop({ required: true })
  name: Name;

  @Prop({ required: true })
  cityList: City[];
}
