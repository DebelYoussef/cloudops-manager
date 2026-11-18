import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toSkipTake({ page, limit }: PaginationDto) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationDto,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}