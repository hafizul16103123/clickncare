
import { modelOptions, prop } from "@typegoose/typegoose";
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
		collection: 'product-review',
	},
})
export class ProductReview {
  @prop()
  customer_id: number;

  @prop()
  customer_name: string;

  @prop()
  product_id: number;

  @prop()
  rating: number;

  @prop()
  review: string;

	@prop({ required: true ,example:"1" })
	imageUrl: string[];

}
