import { SortOrder } from 'mongoose';
import { IPaginationOptions } from 'src/interfaces';

type IOptionsReturn = {
  page: number;
  limit: number;
  skip: number;
  sortConditions: { [key: string]: SortOrder };
};

export class PaginationHelper {
  static calculatePagination(options: IPaginationOptions): IOptionsReturn {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const sortConditions: { [key: string]: SortOrder } = {};
    if (sortBy && sortOrder) {
      sortConditions[sortBy] = sortOrder;
    }

    return {
      page,
      limit,
      skip,
      sortConditions,
    };
  }
}
