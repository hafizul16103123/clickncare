import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import config from '../configuration';
import {  RpcException } from '@nestjs/microservices';
import { extname } from 'path';
import  * as fs from 'fs'


@Injectable()
export class imageUploadService {
	constructor(
	) { }
	public config = config;

	// async uploadImage(file: Express.Multer.File,key:string ): Promise<string> {
	async uploadImage(file: Express.Multer.File,key:string ): Promise<string> {

	
		const extentions =['jpg','jpeg','png'];


		const fileExtension = file.mimetype.split("/")[1];
		if(extentions.includes(fileExtension)){
			// aws upload
			const s3 = await new S3({
				accessKeyId: config.awsAccessKey,
				secretAccessKey: config.awsAccessSecret,

			});
			// upload file
			const promise = fs.readFileSync(file.path, 'base64')
			// delete file
			fs.unlinkSync(file.path)
			const buffer = Buffer.from(promise, 'base64');

			const params = {
				Bucket: 'zdropcontents', // pass your bucket name
				Key: key, // file will be saved as testBucket/contacts.csv
				Body:buffer,
				ContentType: file.mimetype
			};

			let imageUrl ;

			await new Promise( e => {
				s3.upload(params, function (s3Err, data) {
					if (s3Err) throw s3Err;
					e(data);
					imageUrl=  'https://diqo2oyg3bc3n.cloudfront.net/'+data.key;
				})
			})
			return imageUrl;
		}else{
			throw new RpcException('Only jpg, jpeg, png extension is valid');
		}
	
	
	}

}
// function  base64ToArrayBuffer(base64) {
//     var binary_string = this.window.atob(base64);
//     var len = binary_string.length;
//     var bytes = new Uint8Array(len);
//     for (var i = 0; i < len; i++) {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }

export const imageFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
	  return callback(new Error('Only image files are allowed!'), false);
	}
	callback(null, true);
  };

  export const editFileName = (req, file, callback) => {
	const name = file.originalname.split('.')[0];
	const fileExtName = extname(file.originalname);
	const randomName = Array(4)
	  .fill(null)
	  .map(() => Math.round(Math.random() * 16).toString(16))
	  .join('');
	callback(null, `${name}-${randomName}${fileExtName}`);
  };
