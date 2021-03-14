import { HttpException, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { RegionModel, Name } from './entities/region.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(RegionModel)
    private readonly regionModel: ReturnModelType<typeof RegionModel>,
  ) {}

  async findAllByRegion(name: string): Promise<RegionModel> {
    const doc = await this.regionModel.findOne({ 'name.en': name }).lean();
    if (doc) {
      delete doc._id;
      delete doc.createdAt;
      delete doc.updatedAt;
      return doc;
    }

    throw new HttpException('No data found!', 404);
  }

  async findAllRegion(): Promise<any> {
    console.log('futtdsr');

    const doc = await this.regionModel.find().lean();

    if (doc) {
      doc.forEach((e) => {
        delete e._id;
        delete e.cityList;
        delete e.createdAt;
        delete e.updatedAt;
        return e.name;
      });
      return doc.map((e) => {
        return e.name;
      });
    }

    throw new HttpException('No region found!', 404);
  }

  async findAllCityByRegion(region: string): Promise<Name[]> {
    const doc = await this.regionModel.findOne({ 'name.en': region }).lean();
    if (doc) {
      if (doc.cityList && doc.cityList.length > 0) {
        const cities = doc.cityList.map((e) => {
          return e.name;
        });
        return cities;
      }
    }

    throw new HttpException('No city found!', 404);
  }

  async findAllAreaByCity(region: string, city: string): Promise<Name[]> {
    const doc = await this.regionModel.findOne({ 'name.en': region }).lean();
    if (doc) {
      if (doc.cityList && doc.cityList.length > 0) {
        const target = doc.cityList.find((e) => e.name.en === city);
        if (!target) throw new HttpException('No area found!', 404);
        return target.zones;
      }
    }

    throw new HttpException('No area found!', 404);
  }

  async post(dat: RegionModel) {
    return await this.regionModel.create(dat);
  }
}
