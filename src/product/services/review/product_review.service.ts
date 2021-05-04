import { HttpException, Injectable, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User } from 'src/auth/user/user.decorator';
import { imageUploadService } from 'src/imageUpload/imageUpload.service';
import { ProductReview } from 'src/product/entities/review/product_review.entity';

@Injectable()
export class ProductReviewService {
  constructor(
    @InjectModel(ProductReview)
    private readonly productReview: ReturnModelType<typeof ProductReview>,
    private readonly imageUploadService :imageUploadService,
  ) {}

  async createProductReview(data: ProductReview): Promise<any> {
    if (data.rating >= 1 && data.rating <= 5) {
      return await this.productReview.create(data);
    }
  }

	async uploadImage(files,body): Promise<any> {
		const doc = await this.productReview.findOne({ _id: body.id });
		if (!doc) throw new RpcException('Review Not found');

      // files.forEach(async file => {
      
        
      // });
      for (const file of files) {
          //aws upload
          const key = 'product/review/' + Date.now() + '.jpg';
          const imageUrl = await this.imageUploadService.uploadImage(file,key)
          const data :any={
            imageUrl:imageUrl
          }
          doc.imageUrl.push(data.imageUrl);
        
      }
     return (await doc.save()).toJSON()

	}

  async getProductReview(productId: number): Promise<any | null> {
    const getProductReview = await this.productReview
      .find({ product_id: productId })
      .exec();
    const getProdRev = getProductReview.map((e) => {
      return { customerName: e.customer_name, review: e.review };
    });

    let i = 0;
    let totalRating = 0;
    let aveRating = 0.0;
    let retOneCount = 0;
    let retTwoCount = 0;
    let retThreeCount = 0;
    let retFourCount = 0;
    let retFiveCount = 0;

    for (const item of getProductReview) {
      i++;
      totalRating = totalRating + item.rating;

      switch (item.rating) {
        case 1:
          retOneCount++;
          break;
        case 2:
          retTwoCount++;
          break;
        case 3:
          retThreeCount++;
          break;
        case 4:
          retFourCount++;
          break;
        case 5:
          retFiveCount++;
          break;
        default:
          0;
      }
    }

    aveRating = totalRating / i;

    const objRatePerc = {
      RateFivePerc: ((retFiveCount / i) * 100).toFixed(),
      RateFourPerc: ((retFourCount / i) * 100).toFixed(),
      RateThreePerc: ((retThreeCount / i) * 100).toFixed(),
      RateTwoPerc: ((retTwoCount / i) * 100).toFixed(),
      RateOnePerc: ((retOneCount / i) * 100).toFixed(),
    };

    const prodRev = {
      totalRating: i,
      rating: aveRating.toFixed(1), //parseFloat(aveRating.toString()), //aveRating
      ratingPercentage: objRatePerc,
      reviews: getProdRev,
    };

    return prodRev;
  }
}
