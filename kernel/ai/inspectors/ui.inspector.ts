import { lynx } from "../lynx.client";

export async function uiInspector(modelName: string, uiSchema: any, metadata: any) {
  return await lynx(`
You are the Kernel UI Schema Auditor.
Review this UI schema against its metadata for:
- component/type mismatches (e.g., TextInput for number field)
- accessibility issues (missing labels, ARIA)
- UX problems (layout, field ordering)
- missing required field indicators
- enum options not matching metadata

Model: ${modelName}

UI Schema:
${JSON.stringify(uiSchema, null, 2)}

Metadata:
${JSON.stringify(metadata, null, 2)}

Provide specific, actionable recommendations.
  `);
}

export async function suggestUISchema(metadata: any) {
  return await lynx(`
Generate an optimal UI schema for this metadata.

Metadata:
${JSON.stringify(metadata, null, 2)}

Consider:
- appropriate components for each field type
- logical field grouping
- responsive layout
- accessibility
- user experience

Output as valid JSON UI schema.
  `);
}

