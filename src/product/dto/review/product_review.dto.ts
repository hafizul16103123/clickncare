import { ApiProperty } from '@nestjs/swagger';

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
}
