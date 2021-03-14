import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateAttributeDto {
  @ApiHideProperty()
  category_id: number;

  @ApiProperty()
  attribute: string[];

  @ApiProperty()
  name: string;
}
