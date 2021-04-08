import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { DeliveryLocationDto } from 'src/product/dto/delivery/delivery_location.dto';
import { DeliveryLocation } from 'src/product/entities/delivery/delivery_location.entity';
import * as fs from 'fs';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class DeliveryLocationService {
  constructor(
    @InjectModel(DeliveryLocation)
    private readonly deliveryLocation: ReturnModelType<typeof DeliveryLocation>,

    @InjectModel(Product)
    private readonly productModel: ReturnModelType<typeof Product>,
  ) {}

  async getDefaultDeliveryLocation(
    id = '739',
  ): Promise<DeliveryLocationDto | unknown> {
    const getDelivLocation = await this.deliveryLocation.findOne({ id }).exec();
    const defaultDeliveryLocation =
      getDelivLocation.cityName + ' ' + getDelivLocation.area;

    const defDelivAddress = {
      value: getDelivLocation.id,
      name: defaultDeliveryLocation,
      charge: getDelivLocation.charge,
    };

    return defDelivAddress;
  }

  async getDeliveryLocation(): Promise<DeliveryLocationDto | unknown> {
    const allDeliveryLocation = [];
    const getDelivLocation = await this.deliveryLocation.find().exec();

    for (const item of getDelivLocation) {
      const defaultDeliveryLocation = item.cityName + ' ' + item.area;

      const obj = {
        value: item.id,
        name: defaultDeliveryLocation,
        charge: item.charge,
      };

      allDeliveryLocation.push(obj);
    }

    return allDeliveryLocation;
  }

  async createDeliveryLocation(data: DeliveryLocation): Promise<any> {
    return await this.deliveryLocation.create(data);
  }

  async changeDeliveryLocation(data: any) {
    const fData = {
      address: {
        name: `${data.data.region} - ${data.data.city} - ${data.data.area} `,
        value: '45403jsdnbuowrht03u',
        charge: Math.floor(Math.random() * 110),
      },
      duration: 'Usually delivered in 4-5 days to this area',
    };
    this.deliveryChargeValue(data.data.id, data.data.region);
    console.log(data.data.id);

    return fData;
  }

  async deliveryChargeValue(productID, region) {
    const charge = fs.readFileSync(
      'src/product/services/delivery/data/delivery_charge.json',
      'utf8',
    );
    const charge_jsons = JSON.parse(charge);
    const chargeData = charge_jsons.filter((e) => e.destination == region);

    const product = this.productModel.findOne({ productID: productID });

    console.log('1', chargeData[0].zeroToZeroPointFive);
  }
}
