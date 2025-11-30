import { lynx } from "../lynx.client";

export async function contractInspector(engine: any, validationResult: any) {
  return await lynx(`
You are the Kernel Contract Auditor.
Analyze these contract validation results and provide:
1. Root cause analysis for each error
2. Specific fix recommendations
3. Prevention strategies

Engine: ${engine.manifest?.name || "unknown"}
Version: ${engine.manifest?.version || "unknown"}

Validation Result:
${JSON.stringify(validationResult, null, 2)}

Engine Manifest:
${JSON.stringify(engine.manifest, null, 2)}
  `);
}

export async function versionCompatibilityCheck(oldManifest: any, newManifest: any) {
  return await lynx(`
Check version compatibility between engine versions.

Old Version:
${JSON.stringify(oldManifest, null, 2)}

New Version:
${JSON.stringify(newManifest, null, 2)}

Identify:
1. Breaking changes
2. Backward compatibility issues
3. Migration requirements
4. Deprecation warnings
  `);
}

