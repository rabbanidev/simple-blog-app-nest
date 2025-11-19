import { IPaginationMeta } from './pagination.interface';

export interface IControllerData {
  success?: boolean;
  message: string;
  data: {
    data: any;
    meta?: IPaginationMeta;
  };
}
