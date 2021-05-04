import { Module } from '@nestjs/common';
import { imageUploadService } from './imageUpload.service';
@Module({
	providers: [imageUploadService],
})
export class imageUploadModule {}