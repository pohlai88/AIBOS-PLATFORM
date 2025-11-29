import { lynx } from "./lynx.client";
import { metadataRegistry } from "../registry/metadata.registry";
import { uiRegistry } from "../ui/ui.registry";
import { contractEngine } from "../contracts/contract-engine";
import { createContextLogger } from "../observability/logger";

const logger = createContextLogger({ module: "kernel:ai:governance" });

export const governanceHooks = {
  async analyzeMetadata() {
    const models = Array.from(metadataRegistry.models.entries());
    if (models.length === 0) return "No metadata to analyze.";
    
    return lynx(`
You are the AI-BOS Kernel Metadata Auditor.
Review this metadata for:
- redundant fields
- inconsistency
- missing descriptions
- naming issues
- relationship problems
- type mismatches

Metadata:
${JSON.stringify(models, null, 2)}
    `);
  },

  async analyzeUI() {
    const schemas = uiRegistry.list().map(m => ({
      model: m,
      schema: uiRegistry.get(m)
    }));
    
    if (schemas.length === 0) return "No UI schemas to analyze.";

    return lynx(`
You are the AI-BOS UI Schema Auditor.
Analyze these UI schemas for:
- component/type mismatches
- accessibility issues
- UX problems
- missing labels
- inconsistent layouts

UI Schemas:
${JSON.stringify(schemas, null, 2)}
    `);
  },

  async analyzeContracts(engine: any) {
    const result = contractEngine.validateEngine(engine);
    
    return lynx(`
You are the AI-BOS Contract Auditor.
Explain these engine contract validation results and suggest fixes:

Engine: ${engine.manifest?.name || "unknown"}
Validation Result:
${JSON.stringify(result, null, 2)}
    `);
  },

  async analyzeEvent(event: any) {
    return lynx(`
You are the AI-BOS Event Analyzer.
Analyze this system event for:
- anomalies
- patterns
- workflow suggestions
- potential issues

Event:
${JSON.stringify(event, null, 2)}
    `);
  },

  async suggestFieldDescriptions(modelName: string) {
    const model = metadataRegistry.getModel(modelName);
    if (!model) return `Model '${modelName}' not found.`;

    return lynx(`
You are the AI-BOS Documentation Assistant.
Write clear, professional descriptions for each field in this model.
Output as JSON with field names as keys and descriptions as values.

Model: ${modelName}
Schema:
${JSON.stringify(model, null, 2)}
    `);
  },

  async suggestWorkflow(eventName: string) {
    return lynx(`
You are the AI-BOS Workflow Advisor.
Suggest automated workflows that should trigger on this event:

Event: ${eventName}

Provide:
1. Recommended workflow steps
2. Conditions/guards
3. Notifications
4. Follow-up actions
    `);
  },

  async validateMicroApp(manifest: any, metadata: any) {
    return lynx(`
You are the AI-BOS Marketplace Validator.
Review this micro-app submission for:
- security issues
- metadata quality
- naming conventions
- permission scope
- potential conflicts

Manifest:
${JSON.stringify(manifest, null, 2)}

Metadata:
${JSON.stringify(metadata, null, 2)}
    `);
  }
};

// Auto-run governance on boot (optional)
export async function runBootGovernance() {
  logger.info("Running Lynx governance checks...");
  
  const metadataAnalysis = await governanceHooks.analyzeMetadata();
  logger.info({ analysis: metadataAnalysis }, "governance.metadata.complete");
  
  const uiAnalysis = await governanceHooks.analyzeUI();
  logger.info({ analysis: uiAnalysis }, "governance.ui.complete");
  
  logger.info("governance.boot.complete");
}

