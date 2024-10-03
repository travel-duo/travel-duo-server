import { Injectable } from '@nestjs/common';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { SortDto } from '@/common/dto/sort.dto';
import { applyFilter } from '@/common/utils/filter.util';
import { applySort } from '@/common/utils/sort.util';
import { applyPagination } from '@/common/utils/pagination.util';
import { FilterExpression } from '@/common/utils/filter/types';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SearchFilterService {
  constructor() {}

  public async searchAndPaginateResults(
    queryBuilder: SelectQueryBuilder<any>,
    entityName: string,
    filter: FilterExpression,
    paginationDto: PaginationDto,
    sortDto: SortDto,
    allowedFields: string[] = [],
    joinedFields: string[] = [],
  ) {
    const joinedAliases = new Set<string>();
    // Join tables
    joinedFields.forEach((field) => {
      const parts = field.split('.');
      let alias = entityName;

      for (let i = 0; i < parts.length; i++) {
        const newAlias = `${alias}_${parts[i]}`;
        if (!joinedAliases.has(newAlias)) {
          queryBuilder.leftJoinAndSelect(`${alias}.${parts[i]}`, newAlias);
          joinedAliases.add(newAlias);
        }
        alias = newAlias;
      }
    });

    // Apply additional filters
    applyFilter(queryBuilder, filter, entityName, allowedFields, joinedFields);

    // Apply sorting
    applySort(queryBuilder, entityName, sortDto, allowedFields, joinedFields);

    // Apply pagination
    applyPagination(queryBuilder, paginationDto);

    // Execute query
    const [contents, total] = await queryBuilder.getManyAndCount();

    return {
      contents,
      meta: {
        total,
        page: paginationDto.page,
        limit: paginationDto.limit,
        totalPages: Math.ceil(total / paginationDto.limit),
        sortBy: sortDto.sortBy,
        sortOrder: sortDto.sortOrder,
      },
    };
  }
}
