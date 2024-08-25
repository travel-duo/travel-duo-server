export function parseField(
  entityName: string,
  field: string,
): [string, string | null] {
  const parts = field.split('.');
  if (parts.length === 1) {
    return [`${entityName}.${field}`, null];
  }
  return [`${entityName}.${parts[0]}`, parts.slice(1).join('.')];
}

export function escapeLikeString(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}
