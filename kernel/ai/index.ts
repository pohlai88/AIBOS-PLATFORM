// Lynx AI exports
export { lynx, lynxStream } from "./lynx.client";
export { initAI, askLynx } from "./lynx.adapter";
export { governanceHooks, runBootGovernance } from "./governance.hooks";

// Inspectors
export { metadataInspector, fieldAnalyzer } from "./inspectors/metadata.inspector";
export { actionInspector, actionTestGenerator } from "./inspectors/action.inspector";
export { uiInspector, suggestUISchema } from "./inspectors/ui.inspector";
export { contractInspector, versionCompatibilityCheck } from "./inspectors/contract.inspector";
export { eventInspector, eventPatternAnalyzer, anomalyDetector } from "./inspectors/event.inspector";
