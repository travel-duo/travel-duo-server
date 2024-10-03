import { PaginationDto } from '@/common/dto/pagination.dto';

export function applyPagination(
  queryBuilder: any,
  paginationDto: PaginationDto,
) {
  const { page, limit } = paginationDto;
  queryBuilder.skip((page - 1) * limit).take(limit);
}
