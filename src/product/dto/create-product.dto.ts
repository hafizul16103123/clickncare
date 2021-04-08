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

class PackageWeight {
  @ApiProperty()
  weight: number;

  @ApiProperty({ enum: ['g', 'kg'] })
  weightType: string;
}

class PackageDimentions {
  @ApiProperty()
  length: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  dimentionType: string;
}

export class ServiceDeliveryDTO {
  @ApiProperty()
  warrentyType: string;

  @ApiProperty()
  warrentyPeriod: string;

  @ApiProperty()
  warrentyPolicy: string;

  @ApiProperty()
  packageWeight: PackageWeight;

  @ApiProperty()
  packageDimentions?: PackageDimentions;

  @ApiProperty()
  dangerousGood: string;
}

export class PriceStock {
  @ApiHideProperty()
  availability: string;

  @ApiProperty()
  price: number;

  @ApiProperty({
    example: [
      {
        color: 'yellow',
      },
      {
        size: 'L',
      },
    ],
  })
  attribute: any;

  @ApiProperty({ example: 'optional' })
  sizeType?: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  smallImage: string;

  @ApiProperty()
  sellerSKU: string;

  @ApiHideProperty()
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
  hsnCode: string;

  @ApiHideProperty()
  status: string;
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
