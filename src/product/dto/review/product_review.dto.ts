import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProductReviewDto {
  @ApiProperty()
  customer_id: number;

  @ApiProperty()
  customer_name: string;

  @ApiProperty()
  product_id: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  review: string;

  @ApiProperty({type:String,example:"1"})
	imageUrl: string[];

}
