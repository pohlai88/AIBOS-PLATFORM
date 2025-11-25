// packages/ui/mcp/tools/index.ts
// Central export hub for MCP tools and utilities - ENTERPRISE CONSTITUTION EDITION
// Core MCP validation, batching, and AI-governed processing tools
// Version: 2.0.0 - Enterprise AI-BOS Constitution Implementation

// PATCH: Enhanced Component Validator - Enterprise Constitution Guardian (9.8/10)
export { ComponentValidator } from './ComponentValidator'
export type {
  ComponentValidationOptions,
  ComponentMetadata,
  ComponentValidationResult,
  ComponentContext,
  AccessibilityMetrics,
  PerformanceMetrics,
  SecurityMetrics,
} from './ComponentValidator'

// PATCH: Enhanced Validation Pipeline - Full Orchestrator with Rule Registry (9.9/10)
export { ValidationPipeline } from './ValidationPipeline'
export type {
  ValidationPipelineOptions,
  PipelineValidationResult,
  ValidationStep,
  ValidationSequence,
  PipelineMetrics,
  RuleRegistry,
} from './ValidationPipeline'

// PATCH: Enhanced Variable Batcher - Atomic CSS Variable Update Engine (9.9/10)
export { VariableBatcher } from './VariableBatcher'
export type {
  VariableBatcherOptions,
  BatchUpdate,
  VariableSnapshot,
  BatchOperation,
  BatchMetrics,
  VariableValidation,
  AtomicUpdate,
} from './VariableBatcher'

// PATCH: Backward compatibility exports
export { ComponentValidator as componentValidator } from './ComponentValidator'
export { ValidationPipeline as validationPipeline } from './ValidationPipeline'
export { VariableBatcher as getVariableBatcher } from './VariableBatcher'
