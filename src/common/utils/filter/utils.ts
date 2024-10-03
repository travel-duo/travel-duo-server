import { BadRequestException } from '@nestjs/common';

export function getFieldExpression(
  columnName: string,
  jsonPath: string | null,
): string {
  return jsonPath ? `JSON_EXTRACT(${columnName}, '$.${jsonPath}')` : columnName;
}

export function getLikePattern(operator: string, value: string): string {
  switch (operator) {
    case 'contains':
    case 'not_contains':
      return `%${value}%`;
    case 'starts_with':
      return `${value}%`;
    case 'ends_with':
      return `%${value}`;
    default:
      throw new BadRequestException(`Invalid LIKE operator: ${operator}`);
  }
}

export function escapeLikeString(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

export function parseField(
  sortBy: string,
  joinedFields: string[],
): {
  field: string;
  jsonPath?: string;
  relation?: string;
} {
  const parts = sortBy.split('.');
  if (parts.length === 1) {
    return { field: parts[0] };
  } else if (parts.length === 2) {
    if (joinedFields.includes(parts[0])) {
      return { relation: parts[0], field: parts[1] };
    }
    return { field: parts[0], jsonPath: parts[1] };
  } else if (parts.length === 3) {
    if (!joinedFields.includes(parts[0])) {
      throw new BadRequestException(`Invalid sort field: ${sortBy}`);
    }
    return { relation: parts[0], field: parts[1], jsonPath: parts[2] };
  } else {
    throw new BadRequestException(`Invalid sort field: ${sortBy}`);
  }
}
