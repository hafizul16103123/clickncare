import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadImageService } from 'src/product/services/image-cdn/upload-image.service';
import { Express } from 'express';
import { Multer } from 'multer';
import { FileFormat } from 'aws-sdk/clients/computeoptimizer';
import { FileMetadata } from 'aws-sdk/clients/codecommit';
import { Product } from 'src/product/entities/product.entity';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

@ApiTags('products Related Operations')
@Controller('image')
export class UploadImageController {
  constructor(
    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,

    private readonly uploadImageService: UploadImageService,
  ) {}

  @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  async UploadedFilesUsingService(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req,
  ) {
    console.log(file);

    return {
      imahe:
        'https://ae01.alicdn.com/kf/H2d7688f12dcc478f82746b52d565ca44O/DEKABR-Large-Size-50-Men-Loafers-Soft-Moccasins-High-Quality-Spring-Autumn-Genuine-Leather-Shoes-Men.jpg_640x640.jpg',
      smallImage:
        'https://ae01.alicdn.com/kf/H2d7688f12dcc478f82746b52d565ca44O/DEKABR-Large-Size-50-Men-Loafers-Soft-Moccasins-High-Quality-Spring-Autumn-Genuine-Leather-Shoes-Men.jpg_50x50.jpg_.webp',
    };
  }

  @Post('upload2')
  // @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.productModel.updateMany(
      {
        sellerID: 'ZDSEL1615104630',
      },
      { $set: { sellerID: 'ZDSEL1616922757' } },
    );
    console.log(file);
  }
}
