import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadImageService } from 'src/product/services/image-cdn/upload-image.service';
import { Express } from 'express';
import { FileFormat } from 'aws-sdk/clients/computeoptimizer';
import { FileMetadata } from 'aws-sdk/clients/codecommit';

@ApiTags('products Related Operations')
@Controller('image')
export class UploadImageController {
  constructor(
    // @InjectModel(Product)
    // private readonly productModel: ReturnModelType<typeof Product>,

    private readonly uploadImageService: UploadImageService,
  ) {}

  @Post('azure/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async UploadedFilesUsingService(
    @UploadedFile()
    file: any,
  ) {
    console.log(file);
  }
}
