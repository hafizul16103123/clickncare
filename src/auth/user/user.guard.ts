import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fs from 'fs';
var jwt = require('jsonwebtoken');

@Injectable()
export class UserGuard implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new HttpException('User not authenticated!', 403);
    try {
      const key = fs.readFileSync('src/auth/key/publickey.pem', 'utf8');
      const decoded = jwt.verify(token.split(' ').pop(), key);
      request.user = decoded.id;
      return true;
    } catch (error) {
      return false;
    }
  }
}
