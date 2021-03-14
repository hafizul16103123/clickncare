import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class DeliveryLocationDto {
  @ApiProperty()
  region: string;

  @ApiProperty()
  cityID: string;

  @ApiProperty()
  cityName: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  area: string;

  @ApiProperty()
  eCourier: string;

  @ApiProperty()
  sundarban: string;

  @ApiProperty()
  minhaz: string;

  @ApiProperty()
  gogo: string;

  @ApiProperty()
  charge: number;
}

export class ChangeDeliveryLocatiob {
  @ApiProperty()
  data: any;
}
