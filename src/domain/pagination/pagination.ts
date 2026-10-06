export const DEFAULT_PAGE_SIZE = 10;

export interface PaginationParams {
  limit: number;
  offset: number;
  search?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}
