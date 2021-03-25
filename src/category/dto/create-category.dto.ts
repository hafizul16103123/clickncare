import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  parentId: number;

  @ApiProperty()
  image: string;
}

export class AttributeData {
  @ApiProperty()
  data: any;
}
