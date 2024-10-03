import { Brackets } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import {
  FilterCondition,
  FilterExpression,
  LogicalOperator,
} from '@/common/utils/filter/types';
import {
  ALLOWED_OPERATORS,
  AllowedOperator,
} from '@/common/utils/filter/constants';
import { parseField } from '@/common/utils/filter/utils';
import { applyOperator } from '@/common/utils/filter/operators';

export function applyFilter(
  queryBuilder: any,
  filter: FilterExpression,
  entityName: string,
  allowedFields: string[] = [],
  joinedFields: string[] = [],
) {
  if ('and' in filter || 'or' in filter || 'not' in filter) {
    applyLogicalOperator(
      queryBuilder,
      filter as Record<LogicalOperator, FilterExpression[]>,
      entityName,
      allowedFields,
      joinedFields,
    );
  } else {
    applyCondition(
      queryBuilder,
      filter as FilterCondition,
      entityName,
      allowedFields,
      joinedFields,
    );
  }
}

function applyLogicalOperator(
  queryBuilder: any,
  filter: Record<LogicalOperator, FilterExpression[]>,
  entityName: string,
  allowedFields: string[],
  joinedFields: string[],
) {
  const [operator, conditions] = Object.entries(filter)[0] as [
    LogicalOperator,
    FilterExpression[],
  ];

  if (!conditions || !Array.isArray(conditions)) {
    throw new BadRequestException('Invalid logical operator or conditions');
  }

  queryBuilder.andWhere(
    new Brackets((qb) => {
      conditions.forEach((condition, index) => {
        const method = operator === 'and' ? 'andWhere' : 'orWhere';
        qb[method](
          new Brackets((subQb) => {
            applyFilter(
              subQb,
              condition,
              entityName,
              allowedFields,
              joinedFields,
            );
          }),
        );
      });
    }),
  );
}

function applyCondition(
  queryBuilder: any,
  condition: FilterCondition,
  entityName: string,
  allowedFields: string[],
  joinedFields: string[],
) {
  Object.entries(condition).forEach(([field, operators]) => {
    if (
      !allowedFields.includes(field.split('.')[0]) &&
      !joinedFields.includes(field.split('.')[0])
    ) {
      throw new BadRequestException(
        `Field ${field} is not allowed for filtering`,
      );
    }

    Object.entries(operators).forEach(([operator, value]) => {
      if (!ALLOWED_OPERATORS.includes(operator as AllowedOperator)) {
        throw new BadRequestException(`Invalid operator: ${operator}`);
      }

      const paramName = `${field.replace('.', '_')}${operator}`;

      const parsedField = parseField(field, joinedFields);

      if (parsedField.relation) {
        let fieldExpression = `${parsedField.relation}.${parsedField.field}`;
        if (parsedField.jsonPath) {
          fieldExpression = `JSON_EXTRACT(${fieldExpression}, '$.${parsedField.jsonPath}')`;
        }
        applyOperator(
          queryBuilder,
          operator as AllowedOperator,
          fieldExpression,
          paramName,
          value,
        );
      } else {
        let fieldExpression = `${entityName}.${field}`;
        if (parsedField.jsonPath) {
          fieldExpression = `JSON_EXTRACT(${entityName}.${parsedField.field}, '$.${parsedField.jsonPath}')`;
        }
        applyOperator(
          queryBuilder,
          operator as AllowedOperator,
          fieldExpression,
          paramName,
          value,
        );
      }
    });
  });
}
