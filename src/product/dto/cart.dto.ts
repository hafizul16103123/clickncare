import { ApiProperty } from '@nestjs/swagger';
import { Ref } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { Product } from '../entities/product.entity';

export class CartDTO {
  @ApiProperty({
    type: Schema.Types.ObjectId,
    required: true,
    example: '6018eee44771521e108848a5',
  })
  productID: Ref<Product>;

  @ApiProperty({
    required: true,
    type: String,
    example: 'gfdgfd7gf6g6fg6fgfd-11-2221',
  })
  globalSKU: string;

  @ApiProperty({ required: true, type: Number, example: 1 })
  quantity: number;

  @ApiProperty({ required: false, type: String, example: 'shippingmethods' })
  shippingMethod?: string;

  @ApiProperty({ required: false, type: Number, example: 100 })
  shippingCharge?: number;
}
