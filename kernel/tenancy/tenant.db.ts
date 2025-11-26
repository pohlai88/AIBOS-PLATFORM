export function tableName(tenantId: string, model: string) {
  return `${tenantId}_${model}`;
}

