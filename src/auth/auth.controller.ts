import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGuard } from './user/user.guard';
import { User } from './user/user.decorator';
import { Seller } from './seller/seller.decorator';
import { SellerGuard } from './seller/seller.guard';

@ApiTags('Check auth')
@Controller('auth')
export class AuthController {
  constructor() {}

  @UseGuards(SellerGuard)
  @ApiBearerAuth()
  @Get()
  async findOne(@Seller() user: string) {
    return user;
  }
}
