import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class UploadImageService {
  async uploadImage(body: any, customerZID: string): Promise<any> {
    // const doc = await this.customerModel.findOne({ zID: customerZID });
    // if (!doc) throw new HttpException('Customer Not found', 404);

    // // aws upload
    // const s3 = await new S3({
    //   accessKeyId: config.awsAccessKey,
    //   secretAccessKey: config.awsAccessSecret,
    // });

    const fileName = 'src/home/contents/home/budget_shopping/1-image-1.png';

    const key = 'customer/profile/images/img.png';

    const uploadFile = () => {
      fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        // const data = body.image;
        console.log(JSON.stringify(data, null, 2));
        const params = {
          Bucket: 'zdropcontents', // pass your bucket name
          Key: key, // file will be saved as testBucket/contacts.csv
          Body: JSON.stringify(data, null, 2),
        };
        // s3.upload(params, function (s3Err, data) {
        //   if (s3Err) throw s3Err;
        //   console.log(data.Location);
        //   console.log(`File uploaded successfully at ${data.Location}`);
        // });
      });
    };

    uploadFile();
    //aws upload

    // return (await doc.save()).toJSON();
  }
}
