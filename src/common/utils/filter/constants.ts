export const ALLOWED_OPERATORS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'json_contains',
  'is',
  'nis',
] as const;

export type AllowedOperator = (typeof ALLOWED_OPERATORS)[number];

export const OPERATOR_MAP: Record<AllowedOperator, string> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  in: 'IN',
  nin: 'NOT IN',
  contains: 'LIKE',
  not_contains: 'NOT LIKE',
  starts_with: 'LIKE',
  ends_with: 'LIKE',
  json_contains: 'JSON_CONTAINS',
  is: 'IS',
  nis: 'IS NOT',
};
