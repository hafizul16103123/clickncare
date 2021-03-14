import { ApiProperty } from '@nestjs/swagger';
import { Ref } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { Product } from '../entities/product.entity';

export class WishlistDTO {
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
}
