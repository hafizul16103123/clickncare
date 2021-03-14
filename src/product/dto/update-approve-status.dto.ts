import { PartialType } from '@nestjs/swagger';
import { ChangeActiveStatus, ChangeApproveStatus } from './create-product.dto';

export class UpdateProductApproveStatus extends PartialType(
  ChangeApproveStatus,
) {}

export class UpdateProductActiveStatus extends PartialType(
  ChangeActiveStatus,
) {}
