/**
 * Orchestra Module
 * 
 * GRCD-KERNEL v4.0.0 Section 6.3: AI-Orchestra Coordination
 * Central export for all Orchestra governance components
 */

// Types
export * from "./types";

// Schemas
export * from "./schemas/orchestra-manifest.schema";

// Registry
export { OrchestraRegistry, orchestraRegistry } from "./registry/orchestra-registry";

// Coordinator
export { OrchestraConductor, orchestraConductor } from "./coordinator/conductor";
export { CrossOrchestraAuth, crossOrchestraAuth } from "./coordinator/cross-orchestra";

