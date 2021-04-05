export interface IConfig {
  port: number;
  mongoURL: string;
  redisURL: string;
  paginateViewLimit: number;
  onHoldTTL: number;
  pageLimit: number;
}
// import Joi from '@hapi/joi';
import * as dotenv from 'dotenv';
dotenv.config();

export const configuration = (): IConfig => {
  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoURL: process.env.MONGODB_URL,
    redisURL: process.env.REDIS_URL,
    pageLimit: 40,
    paginateViewLimit: 40,
    onHoldTTL: parseInt(process.env.ON_HOLD_TTL, 10) || 1000 * 60 * 5,
  };
};
export default configuration();
