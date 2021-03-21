import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Ref } from '@typegoose/typegoose';
import { Category } from 'src/category/entities/category.entity';

import { Product } from '../entities/product.entity';

export class ProductSpecificationDTO {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;
}

export class ServiceDeliveryDTO {
  @ApiProperty()
  warrentyType: string;

  @ApiProperty()
  warrentyPeriod: string;

  @ApiProperty()
  warrentyPolicy: string;

  @ApiProperty()
  packageWeight: string;

  @ApiProperty()
  packageDimentions: string;

  @ApiProperty()
  dangerousGood: string;
}

export class PriceStock {
  @ApiProperty()
  availability: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  size: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  attribute: any;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  smallImage: string;

  @ApiProperty()
  sellerSKU: string;

  @ApiProperty()
  globalSKU: string;

  @ApiProperty()
  freeItems: string;
}

export class CreateProductDto {
  @ApiHideProperty()
  productID: number;

  @ApiHideProperty()
  sellerID: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  // @Transform((value: any) => mongoose.Types.ObjectId(value))
  categoryId: Ref<Category>;

  @ApiProperty()
  varient: any;

  @ApiProperty()
  video: string;

  @ApiProperty()
  highlights: string;

  @ApiProperty()
  longDescription: string;

  @ApiProperty()
  englishDescription: string;

  @ApiProperty()
  whatInTheBox: string;

  @ApiProperty()
  image: any[];

  @ApiProperty({ type: [ProductSpecificationDTO] })
  specification: ProductSpecificationDTO[];

  @ApiProperty()
  serviceDelivery: ServiceDeliveryDTO;

  @ApiProperty({ type: [PriceStock] })
  priceStock: PriceStock[];

  @ApiProperty()
  size: any[];

  @ApiHideProperty()
  status: string;

  @ApiProperty()
  color: any[];

  @ApiProperty()
  @ApiPropertyOptional()
  sizeType?: string;
}

export class ChangeActiveStatus {
  @ApiProperty()
  active_status: string;
}

export class ChangeApproveStatus {
  @ApiProperty()
  approve_status: string;
}
export class ProductWithBannerImage {
  products: Product[];
  bannerImage: string;
}
