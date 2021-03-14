import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
} from '@nestjs/common';
import * as fs from 'fs';
import { ClientProxy } from '@nestjs/microservices';
var jwt = require('jsonwebtoken');

@Injectable()
export class SellerGuard implements CanActivate {
  constructor(@Inject('MICRO_SERVICE') private readonly redis: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new HttpException('User not authenticated!', 401);
    try {
      const key = fs.readFileSync('src/auth/key/publickey.pem', 'utf8');
      const decoded = jwt.verify(token.split(' ').pop(), key);
      request.seller = decoded.id;

      // check seller approved or not
      const sellerInfo = await this.redis
        .send({ cmd: 'FIND_SELLERID_BY_Z_ID' }, '603f2e6a43cb1b38a0335d0f')
        .toPromise();

      if (sellerInfo.status == 'approved') {
        return true;
      } else {
        request.seller = 'Seller Not Approved';
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}
