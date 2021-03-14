import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { TypegooseModule } from 'nestjs-typegoose';
import { Attribute } from './entities/attribute.entity';
import { CategoryMicroServiceController } from './microservice-controllers/category-micro-controller';

@Module({
  imports: [TypegooseModule.forFeature([Category, Attribute])],
  controllers: [CategoryController, CategoryMicroServiceController],
  providers: [CategoryService],
})
export class CategoryModule {}
