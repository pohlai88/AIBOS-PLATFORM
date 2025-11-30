import { lynx } from "../lynx.client";

export async function actionInspector(engineName: string, actionName: string, actionCode: string) {
  return await lynx(`
You are the Kernel Action Auditor.
Review this engine action for:
- security vulnerabilities
- missing input validation
- missing audit trail (emit events)
- error handling gaps
- metadata compliance
- permission checks
- transaction safety

Engine: ${engineName}
Action: ${actionName}

Code:
${actionCode}

Provide specific, actionable recommendations.
  `);
}

export async function actionTestGenerator(engineName: string, actionName: string, metadata: any) {
  return await lynx(`
Generate test cases for this action.

Engine: ${engineName}
Action: ${actionName}
Related Metadata: ${JSON.stringify(metadata, null, 2)}

Generate:
1. Happy path test
2. Validation error test
3. Permission denied test
4. Edge case tests

Output as JSON array of test cases.
  `);
}

