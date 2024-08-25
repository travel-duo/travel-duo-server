import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  BoolAndNullOperator,
  ComparisonOperator,
  FilterCondition,
  FilterExpression,
  LogicalOperator,
  StringOperator,
} from '@/common/utils/filter/types';

function parseFilterCondition(condition: string): FilterCondition {
  const [key, operator, value] = condition.split('-');
  const parsedOperator = operator as
    | ComparisonOperator
    | StringOperator
    | BoolAndNullOperator;

  const parsedValue = ['in', 'nin'].includes(parsedOperator)
    ? value.split('|').map((v) => (isNaN(Number(v)) ? v : Number(v)))
    : isNaN(Number(value))
      ? value
      : Number(value);

  return { [key]: { [parsedOperator]: parsedValue } };
}

export function transformFilterExpression(value: string): FilterExpression {
  if (!value) return {};
  const logicalOperator = value.startsWith('or_') ? 'or' : 'and';
  const conditions = value.replace(/^(or|and)_/, '');
  const filterConditions = conditions.split(',').map(parseFilterCondition);

  return { [logicalOperator as LogicalOperator]: filterConditions };
}

export class SearchFilterDto {
  @ApiPropertyOptional({ description: '필터 옵션', example: '{}' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '{}')
  filter?: string = '{}';
}

export class SearchFilterV2Dto {
  @ApiPropertyOptional({
    description: '필터 옵션',
    example: '[and|or]_{key}-{operator}-{value},...',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => JSON.stringify(transformFilterExpression(value)))
  filter?: string = '{}';
}
