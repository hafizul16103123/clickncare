/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import config from '../configuration';

export interface IPaginatedData<T> {
  data: T;
  nextPage: number | null;
  totalCount: number;
  totalPages: number;
  from: number;
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
    console.log(config.paginateViewLimit, totalCount);

    const nextPage = pageNum + 1 > totalPages ? null : pageNum + 1;

    return {
      items: [],
      data: paginatedDocs,
      totalCount,
      totalPages,
      from: pageNum * config.paginateViewLimit - (config.paginateViewLimit - 1),
      to: pageNum * config.paginateViewLimit,
      nextPage,
      currentPage: pageNum,
    };
  }
  return {
    data: [],
    items: [],
    totalCount: 0,
    totalPages: 0,
    from: pageNum * config.paginateViewLimit,
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
    const totalPages = Math.ceil(totalCount / 40);
    const nextPage = pageNum + 1 > totalPages ? null : pageNum + 1;

    return {
      items: [],
      data: paginatedDocs,
      totalCount,
      totalPages,
      from: pageNum * config.paginateViewLimit,
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
    from: pageNum * config.paginateViewLimit,
    to: pageNum * config.paginateViewLimit + config.paginateViewLimit,
    nextPage: null,
    currentPage: pageNum,
  };
}

export async function customDataPaginator(
  items,
  page: number,
  per_page: number,
) {
  // eslint-disable-next-line no-var
  var page = page || 1,
    per_page = per_page || 10,
    offset = (page - 1) * per_page,
    paginatedItems = items.slice(offset).slice(0, per_page),
    total_pages = Math.ceil(items.length / per_page);

  return {
    data: paginatedItems,
    totalPages: total_pages,
    totalCount: items.length,
    currentPage: page,
    nextPage: total_pages > page ? page + 1 : null,
    showingFrom: (page - 1) * per_page + 1,
    showingTo: (page - 1) * per_page + per_page,
    from: (page - 1) * config.paginateViewLimit + 1,
    to: (page - 1) * config.paginateViewLimit + config.paginateViewLimit,
  };
}
