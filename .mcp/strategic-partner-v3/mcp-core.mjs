/**
 * MCP CORE INFRASTRUCTURE
 * Implements patterns from MaterialExpressiveMcp & sarv-ui
 * 
 * Key Skills:
 * 1. Validation Pipelines
 * 2. Performance Monitoring
 * 3. Enhanced Error Handling
 */

// --- SKILL 3: ENHANCED ERROR HANDLING ---

export const ErrorSeverity = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
};

export class MCPError extends Error {
  constructor(type, message, severity, suggestions = [], metadata = {}) {
    super(message);
    this.type = type;
    this.severity = severity;
    this.suggestions = suggestions;
    this.metadata = metadata;
    this.name = "MCPError";
  }
}

// --- SKILL 2: PERFORMANCE MONITORING ---

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(operationId) {
    this.metrics.set(operationId, { start: performance.now() });
  }

  end(operationId) {
    const metric = this.metrics.get(operationId);
    if (metric) {
      metric.end = performance.now();
      const duration = ((metric.end - metric.start) / 1000).toFixed(2);
      console.error(`[PERF] ${operationId}: ${duration}ms`); // Log to stdio error for visibility
      return duration;
    }
    return "0";
  }

  recordMetric(type, value, metadata = {}) {
    // Store metric for later analysis
    const metricKey = `${type}_${Date.now()}`;
    this.metrics.set(metricKey, {
      type,
      value,
      metadata,
      timestamp: Date.now(),
    });
  }
}

// --- SKILL 1: VALIDATION PIPELINE ---

export class ValidationResult {
  constructor(isValid, errors = [], warnings = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
  }
}

export class BasePipeline {
  constructor() {
    this.monitor = new PerformanceMonitor();
  }

  async execute(input, operationName) {
    this.monitor.start(operationName);

    try {
      // 1. Validate
      const validation = this.validate(input);
      if (!validation.isValid) {
        throw new MCPError(
          "VALIDATION_ERROR",
          "Input failed validation",
          ErrorSeverity.WARNING,
          validation.errors
        );
      }

      // 2. Process
      const result = await this.process(input);

      // 3. Finish
      const duration = this.monitor.end(operationName);

      return {
        success: true,
        data: result,
        meta: { duration: `${duration}ms` },
      };
    } catch (error) {
      this.monitor.end(operationName);

      if (error instanceof MCPError) {
        return {
          success: false,
          error: {
            type: error.type,
            message: error.message,
            severity: error.severity,
            suggestions: error.suggestions,
            metadata: error.metadata,
          },
        };
      }

      return {
        success: false,
        error: {
          type: "UNKNOWN_ERROR",
          message: error.message,
          severity: ErrorSeverity.CRITICAL,
          suggestions: ["Check server logs for details"],
        },
      };
    }
  }

  // Abstract methods - must be implemented by subclasses
  validate(input) {
    throw new Error("validate() must be implemented by subclass");
  }

  async process(input) {
    throw new Error("process() must be implemented by subclass");
  }
}

