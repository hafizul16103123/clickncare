import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class PendingPriceDTO extends TimeStamps {
  @ApiHideProperty()
  z_id: string;

  @ApiProperty()
  globalSKU: string;

  @ApiProperty()
  sellerSKU: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: string;

  @ApiHideProperty()
  status: string;
}

export class PriceUpdate {
  @ApiProperty()
  productID: number;

  @ApiProperty({ type: [PendingPriceDTO] })
  data: PendingPriceDTO[];
}
