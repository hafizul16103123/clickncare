/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import config from '../configuration';

export interface IPaginatedData<T> {
  data: T;
  nextPage: number | null;
  totalCount: number;
  totalPages: number;
  form: number;
  to: number;
  currentPage: number;
  items: [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function paginate<T>(
  model: any,
  pageNum = 1,
  populate?: string[],
): Promise<IPaginatedData<T[]>> {
  const docs = await model
    .find({})
    .limit(config.paginateViewLimit)
    .skip(pageNum === 1 ? 0 : pageNum * config.paginateViewLimit)
    .populate(populate)
    .exec();

  if (docs.length > 0) {
    const paginatedDocs = docs.map((e) => e.toJSON() as T);
    const totalCount = await model.countDocuments({}).exec();
    const totalPages = Math.ceil(totalCount / config.paginateViewLimit);
    const nextPage = pageNum + 1 > totalPages ? null : pageNum + 1;

    return {
      items: [],
      data: paginatedDocs,
      totalCount,
      totalPages,
      form: pageNum * config.paginateViewLimit - (config.paginateViewLimit - 1),
      to: pageNum * config.paginateViewLimit + config.paginateViewLimit,
      nextPage,
      currentPage: pageNum,
    };
  }
  return {
    data: [],
    items: [],
    totalCount: 0,
    totalPages: 0,
    form: pageNum * config.paginateViewLimit,
    to: pageNum * config.paginateViewLimit + config.paginateViewLimit,
    nextPage: null,
    currentPage: pageNum,
  };
}

export async function filteredPaginate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  pageNum = 1,
  filter = {},
  populate?: string[],
): Promise<IPaginatedData<T[]>> {
  const docs = await model
    .find(filter)
    .limit(20)
    .skip(pageNum === 1 ? 0 : pageNum * 20)
    .populate(populate)
    .exec();

  if (docs.length > 0) {
    const paginatedDocs = docs.map((e) => e.toJSON() as T);
    const totalCount = await model.countDocuments({}).exec();
    const totalPages = Math.ceil(totalCount / 20);
    const nextPage = pageNum + 1 > totalPages ? null : pageNum + 1;

    return {
      items: [],
      data: paginatedDocs,
      totalCount,
      totalPages,
      form: pageNum * config.paginateViewLimit,
      to: pageNum * config.paginateViewLimit + config.paginateViewLimit,
      nextPage,
      currentPage: pageNum,
    };
  }
  return {
    items: [],
    data: [],
    totalCount: 0,
    totalPages: 0,
    form: pageNum * config.paginateViewLimit,
    to: pageNum * config.paginateViewLimit + config.paginateViewLimit,
    nextPage: null,
    currentPage: pageNum,
  };
}
