import { lynx } from "../lynx.client";

export async function metadataInspector(metadata: any) {
  return await lynx(`
You are the Kernel Metadata Auditor.
Review this metadata for:
- redundant fields
- inconsistency
- missing descriptions
- naming issues (camelCase preferred)
- relationship problems
- type validation gaps
- enum value completeness
- reference integrity

Provide specific, actionable recommendations.

Metadata:
${JSON.stringify(metadata, null, 2)}
  `);
}

export async function fieldAnalyzer(modelName: string, fieldName: string, field: any) {
  return await lynx(`
Analyze this field definition:

Model: ${modelName}
Field: ${fieldName}
Definition: ${JSON.stringify(field)}

Check for:
- appropriate type
- missing constraints
- naming conventions
- description quality
  `);
}

