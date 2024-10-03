import { BadRequestException } from '@nestjs/common';
import { AllowedOperator, OPERATOR_MAP } from './constants';
import { escapeLikeString, getLikePattern } from './utils';

export function applyOperator(
  queryBuilder: any,
  operator: AllowedOperator,
  fieldExpression: string,
  paramName: string,
  value: any,
) {
  switch (operator) {
    case 'in':
    case 'nin':
      applyListOperator(
        queryBuilder,
        fieldExpression,
        operator,
        paramName,
        value,
      );
      break;
    case 'contains':
    case 'not_contains':
    case 'starts_with':
    case 'ends_with':
      applyLikeOperator(
        queryBuilder,
        fieldExpression,
        operator,
        paramName,
        value,
      );
      break;
    case 'json_contains':
      applyJsonContainsOperator(
        queryBuilder,
        fieldExpression,
        paramName,
        value,
      );
      break;
    case 'is':
    case 'nis':
      applyIsOperator(
        queryBuilder,
        fieldExpression,
        operator,
        paramName,
        value,
      );
      break;
    default:
      applySimpleOperator(
        queryBuilder,
        fieldExpression,
        operator,
        paramName,
        value,
      );
  }
}

export function applySimpleOperator(
  queryBuilder: any,
  fieldExpression: string,
  operator: AllowedOperator,
  paramName: string,
  value: any,
) {
  queryBuilder.andWhere(
    `${fieldExpression} ${OPERATOR_MAP[operator]} :${paramName}`,
    { [paramName]: value },
  );
}

export function applyListOperator(
  queryBuilder: any,
  fieldExpression: string,
  operator: 'in' | 'nin',
  paramName: string,
  value: any[],
) {
  if (!Array.isArray(value)) {
    throw new BadRequestException(
      `Invalid value for ${operator} operator. Expected array.`,
    );
  }
  queryBuilder.andWhere(
    `${fieldExpression} ${OPERATOR_MAP[operator]} (:...${paramName})`,
    { [paramName]: value },
  );
}

export function applyLikeOperator(
  queryBuilder: any,
  fieldExpression: string,
  operator: 'contains' | 'not_contains' | 'starts_with' | 'ends_with',
  paramName: string,
  value: string,
) {
  if (typeof value !== 'string') {
    throw new BadRequestException(
      `Invalid value for ${operator} operator. Expected string.`,
    );
  }
  const escapedValue = escapeLikeString(value);
  const likePattern = getLikePattern(operator, escapedValue);
  queryBuilder.andWhere(
    `${fieldExpression} ${OPERATOR_MAP[operator]} :${paramName}`,
    { [paramName]: likePattern },
  );
}

export function applyJsonContainsOperator(
  queryBuilder: any,
  fieldExpression: string,
  paramName: string,
  value: any,
) {
  queryBuilder.andWhere(`JSON_CONTAINS(${fieldExpression}, :${paramName})`, {
    [paramName]: JSON.stringify(value),
  });
}

export function applyIsOperator(
  queryBuilder: any,
  fieldExpression: string,
  operator: 'is' | 'nis',
  paramName: string,
  value: string,
) {
  if (['TRUE', 'FALSE'].includes(value.toUpperCase())) {
    queryBuilder.andWhere(
      `${fieldExpression} ${OPERATOR_MAP[operator === 'is' ? 'eq' : 'neq']} ${value.toUpperCase()}`,
    );
    return;
  }
  queryBuilder.andWhere(
    `${fieldExpression} ${OPERATOR_MAP[operator]} ${value}`,
  );
}
