import { BadRequestException } from '@nestjs/common';
import { SortDto } from '@/common/dto/sort.dto';
import { SelectQueryBuilder } from 'typeorm';
import { parseField } from '@/common/utils/filter/utils';

export function applySort(
  queryBuilder: SelectQueryBuilder<any>,
  entityName: string,
  sortDto: SortDto,
  allowedFields: string[] = [],
  joinedFields: string[] = [],
) {
  if (sortDto.sortBy) {
    if (!isValidSortField(sortDto.sortBy, allowedFields, joinedFields)) {
      throw new BadRequestException(`Invalid sort field: ${sortDto.sortBy}`);
    }
    const { field, jsonPath, relation } = parseField(
      sortDto.sortBy,
      joinedFields,
    );

    if (relation) {
      queryBuilder.leftJoin(
        `${entityName}.${relation}`,
        `${entityName}_${relation}`,
      );
      if (jsonPath) {
        const jsonExtractAlias = `${relation}_${field}_${jsonPath}`;
        queryBuilder.addSelect(
          `JSON_EXTRACT(${relation}.${field}, '$.${jsonPath}')`,
          jsonExtractAlias,
        );
      }
    } else if (jsonPath) {
      const jsonExtractAlias = `${entityName}_${field}_${jsonPath}`;
      queryBuilder.addSelect(
        `JSON_EXTRACT(${entityName}.${field}, '$.${jsonPath}')`,
        jsonExtractAlias,
      );
    }

    const sortExpression = getSortExpression(
      entityName,
      field,
      jsonPath,
      relation,
    );

    queryBuilder.orderBy(sortExpression, sortDto.sortOrder);
  }
}

function isValidSortField(
  sortBy: string,
  allowedFields: string[],
  joinedFields: string[],
): boolean {
  const sortByKey = sortBy.split('.')[0];
  return allowedFields.includes(sortByKey) || joinedFields.includes(sortByKey);
}

function getSortExpression(
  entityName: string,
  field: string,
  jsonPath?: string,
  relation?: string,
): string {
  if (relation) {
    if (jsonPath) {
      return `${relation}_${field}_${jsonPath}`;
    } else {
      return `${relation}.${field}`;
    }
  } else if (jsonPath) {
    return `${entityName}_${field}_${jsonPath}`;
  } else {
    return `${entityName}.${field}`;
  }
}
