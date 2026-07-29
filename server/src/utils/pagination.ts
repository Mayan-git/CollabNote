export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function normalizePagination(query: PaginationQuery, defaultSortField = 'createdAt'): NormalizedPagination {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sortField = query.sortBy || defaultSortField;
  const sortDirection: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sort: { [sortField]: sortDirection } };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function buildPaginatedResult<T>(items: T[], totalItems: number, page: number, limit: number): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
