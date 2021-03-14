import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async Response(
    success: boolean,
    data: unknown,
    message: string,
  ): Promise<any> {
    return { success, data, message };
  }
}
