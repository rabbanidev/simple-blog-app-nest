import { IPaginationMeta } from './pagination.interface';

export interface IApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: unknown;
  meta?: IPaginationMeta;
}
