export type ComparisonOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin';
export type StringOperator =
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with';
export type BoolAndNullOperator = 'is' | 'nis';

export type FilterCondition = {
  [key: string]: {
    [key in ComparisonOperator | StringOperator | BoolAndNullOperator]?: any;
  };
};

export type LogicalOperator = 'and' | 'or' | 'not';

export type FilterExpression =
  | {
      [key in LogicalOperator]?: FilterExpression[];
    }
  | FilterCondition;
