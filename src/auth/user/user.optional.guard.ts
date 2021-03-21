import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fs from 'fs';
let jwt = require('jsonwebtoken');

@Injectable()
export class UserOptionalGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const token = request.headers.authorization;
      const key = fs.readFileSync('src/auth/key/publickey.pem', 'utf8');
      const decoded = jwt.verify(token.split(' ').pop(), key);
      request.user = decoded.id;
      console.log(decoded);
    } catch (error) {
      console.log(error);
    }
    return true;
  }
}
