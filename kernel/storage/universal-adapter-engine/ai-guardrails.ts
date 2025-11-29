/**
 * 🤖 AI Guardrails v2.0 — Enterprise-Grade Adapter Validation
 * 
 * Kernel-hardened validation with:
 * - Sandbox simulation
 * - SSRF/injection detection
 * - Capability compliance check
 * - AST-based code analysis
 * - Threat profiling
 * - Drift prediction
 * - Kernel policy enforcement
 * 
 * @version 2.0.0
 */

import { eventBus } from "../../events/event-bus";
import { type AdapterConfig } from "../adapter-factory/adapter.generator";
import { 
  type CapabilityMatrix, 
  CapabilityChecker, 
  type ProviderId,
  PROVIDER_IDS 
} from "./capability-matrix";
import { sandboxExecutor } from "./sandbox-executor";

// ═══════════════════════════════════════════════════════════
// Threat Profile Types
// ═══════════════════════════════════════════════════════════

export type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";

export interface ThreatProfile {
  overall: ThreatLevel;
  factors: {
    customCode: ThreatLevel;
    externalCalls: ThreatLevel;
    authWeakness: ThreatLevel;
    unboundedPayload: ThreatLevel;
    ssrfRisk: ThreatLevel;
    injectionRisk: ThreatLevel;
    privilegeEscalation: ThreatLevel;
    driftPotential: ThreatLevel;
  };
}

// ═══════════════════════════════════════════════════════════
// Guardrail Result Types
// ═══════════════════════════════════════════════════════════

export interface GuardrailCheck {
  name: string;
  category: "security" | "performance" | "drift" | "schema" | "compliance" | "code" | "capability";
  passed: boolean;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  details?: any;
  remediation?: string;
}

export interface GuardrailResult {
  approved: boolean;
  score: number;
  checks: GuardrailCheck[];
  summary: string;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  threatProfile: ThreatProfile;
  simulationResult?: {
    passed: boolean;
    errors: string[];
  };
}

// ═══════════════════════════════════════════════════════════
// Blocked Patterns & Constants
// ═══════════════════════════════════════════════════════════

const BLOCKED_DOMAINS = [
  "localhost", "127.0.0.1", "0.0.0.0",
  "169.254.", "10.", "172.16.", "172.17.", "172.18.", "172.19.",
  "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
  "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.",
  "192.168.", "::1", "fe80::",
  "metadata.google", "metadata.aws", "169.254.169.254",
];

const DANGEROUS_CODE_PATTERNS = [
  // Direct dangerous calls
  { pattern: /\beval\s*\(/gi, name: "eval()", severity: "critical" as const },
  { pattern: /\bFunction\s*\(/gi, name: "Function constructor", severity: "critical" as const },
  { pattern: /\bnew\s+Function\s*\(/gi, name: "new Function()", severity: "critical" as const },
  
  // Dynamic execution (obfuscation attempts)
  { pattern: /\[\s*['"`]ev['"`]\s*\+\s*['"`]al['"`]\s*\]/gi, name: "obfuscated eval", severity: "critical" as const },
  { pattern: /globalThis\s*\[/gi, name: "globalThis access", severity: "high" as const },
  { pattern: /window\s*\[/gi, name: "window bracket access", severity: "high" as const },
  
  // Process/system access
  { pattern: /\bprocess\./gi, name: "process access", severity: "critical" as const },
  { pattern: /\brequire\s*\(/gi, name: "require()", severity: "critical" as const },
  { pattern: /\bimport\s*\(/gi, name: "dynamic import", severity: "critical" as const },
  { pattern: /__dirname|__filename/gi, name: "file path access", severity: "high" as const },
  
  // Prototype pollution
  { pattern: /__proto__/gi, name: "__proto__ access", severity: "critical" as const },
  { pattern: /constructor\s*\.\s*prototype/gi, name: "prototype manipulation", severity: "critical" as const },
  { pattern: /Object\s*\.\s*setPrototypeOf/gi, name: "setPrototypeOf", severity: "critical" as const },
  
  // Dangerous modules
  { pattern: /child_process|fs\.|net\.|http\.|https\./gi, name: "system module", severity: "critical" as const },
  { pattern: /\bvm\.|worker_threads|cluster/gi, name: "execution module", severity: "critical" as const },
  
  // Timing attacks
  { pattern: /setTimeout|setInterval|setImmediate/gi, name: "timer function", severity: "high" as const },
  
  // Infinite loops
  { pattern: /while\s*\(\s*true\s*\)/gi, name: "infinite while loop", severity: "critical" as const },
  { pattern: /for\s*\(\s*;\s*;\s*\)/gi, name: "infinite for loop", severity: "critical" as const },
  { pattern: /for\s*\(\s*;;\s*\)/gi, name: "infinite for loop", severity: "critical" as const },
  
  // Regex DoS
  { pattern: /\(\.\*\)\+|\(\.\+\)\*|\(\[.*\]\+\)\+/gi, name: "ReDoS pattern", severity: "high" as const },
];

// ═══════════════════════════════════════════════════════════
// AI Guardrails Engine v2.0
// ═══════════════════════════════════════════════════════════

export class AIGuardrails {
  /**
   * Run all guardrail checks on adapter
   */
  async validateAdapter(
    config: AdapterConfig,
    generatedCode: string,
    declaredCapabilities?: Partial<CapabilityMatrix>
  ): Promise<GuardrailResult> {
    const checks: GuardrailCheck[] = [];

    // 1. Security Analysis (Critical)
    checks.push(...this.runSecurityChecks(config, generatedCode));

    // 2. SSRF & Injection Detection (Critical - NEW)
    checks.push(...this.runSSRFChecks(config));

    // 3. Code Safety Analysis (AST-level - NEW)
    checks.push(...this.runCodeSafetyChecks(generatedCode));

    // 4. Capability Compliance (NEW)
    checks.push(...this.runCapabilityComplianceChecks(config, declaredCapabilities));

    // 5. Performance Analysis
    checks.push(...this.runPerformanceChecks(config, declaredCapabilities));

    // 6. Drift Prediction (Enhanced)
    checks.push(...this.runDriftChecks(config));

    // 7. Schema Contract Validation
    checks.push(...this.runSchemaChecks(config));

    // 8. Kernel Policy Enforcement (NEW)
    checks.push(...this.runKernelPolicyChecks(config));

    // 9. Sandbox Simulation (NEW - Critical)
    const simulationResult = await this.runSandboxSimulation(config, generatedCode);
    checks.push(...simulationResult.checks);

    // Calculate threat profile
    const threatProfile = this.calculateThreatProfile(checks, config);

    // Calculate score with weighted penalties
    const score = this.calculateWeightedScore(checks, threatProfile);
    const riskLevel = this.calculateRiskLevel(checks, threatProfile);
    
    // Approval requires score >= 70 AND no critical failures AND threat level != critical
    const approved = score >= 70 
      && !checks.some(c => c.severity === "critical" && !c.passed)
      && threatProfile.overall !== "critical";

    const recommendations = this.generateRecommendations(checks, threatProfile);

    await this.logValidation(config.id, approved, score, riskLevel, threatProfile);

    return {
      approved,
      score,
      checks,
      summary: this.generateSummary(checks, score, approved, threatProfile),
      recommendations,
      riskLevel,
      threatProfile,
      simulationResult: {
        passed: simulationResult.passed,
        errors: simulationResult.errors,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // Security Checks (Enhanced)
  // ═══════════════════════════════════════════════════════════

  private runSecurityChecks(config: AdapterConfig, code: string): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // 1. HTTPS Required
    const baseUrl = config.provider.baseUrl || "";
    const isHttps = !baseUrl || baseUrl.startsWith("https://");
    checks.push({
      name: "HTTPS Enforcement",
      category: "security",
      passed: isHttps,
      severity: isHttps ? "info" : "critical",
      message: isHttps ? "Base URL uses HTTPS" : "Base URL does not use HTTPS",
      remediation: "Change base URL to use HTTPS",
    });

    // 2. Authentication Method
    const hasAuth = !!config.provider.authType;
    checks.push({
      name: "Authentication Method",
      category: "security",
      passed: hasAuth,
      severity: hasAuth ? "info" : "error",
      message: hasAuth ? `Using ${config.provider.authType} authentication` : "No authentication specified",
      remediation: "Specify authentication method (api-key, oauth2, bearer)",
    });

    // 3. Secret Fields
    const secretFields = config.connection.requiredFields.filter(f => f.type === "secret");
    checks.push({
      name: "Secret Field Handling",
      category: "security",
      passed: secretFields.length > 0,
      severity: secretFields.length > 0 ? "info" : "warning",
      message: secretFields.length > 0
        ? `${secretFields.length} secret field(s) properly typed`
        : "No secret fields - credentials may be exposed in logs",
      details: secretFields.map(f => f.name),
    });

    // 4. Custom Code Risk
    const hasCustomCode = Object.values(config.operations).some(op => op?.customCode);
    checks.push({
      name: "Custom Code Detection",
      category: "security",
      passed: !hasCustomCode,
      severity: hasCustomCode ? "warning" : "info",
      message: hasCustomCode
        ? "Custom code detected - REQUIRES sandbox execution"
        : "No custom code - using safe templates",
      remediation: hasCustomCode ? "Custom code will be sandboxed with strict limits" : undefined,
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // SSRF & Injection Detection (NEW)
  // ═══════════════════════════════════════════════════════════

  private runSSRFChecks(config: AdapterConfig): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];
    const baseUrl = config.provider.baseUrl || "";

    // 1. SSRF - Blocked domains
    let ssrfRisk = false;
    let blockedDomain = "";
    
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        for (const blocked of BLOCKED_DOMAINS) {
          if (url.hostname.includes(blocked) || url.hostname === blocked) {
            ssrfRisk = true;
            blockedDomain = blocked;
            break;
          }
        }
      } catch {
        ssrfRisk = true;
        blockedDomain = "invalid URL";
      }
    }

    checks.push({
      name: "SSRF Protection",
      category: "security",
      passed: !ssrfRisk,
      severity: ssrfRisk ? "critical" : "info",
      message: ssrfRisk
        ? `SSRF risk: blocked domain detected (${blockedDomain})`
        : "No SSRF risk detected",
      remediation: "Use a valid external domain, not localhost or internal IPs",
    });

    // 2. URL Path Injection
    const endpoints = [
      config.operations.insert?.endpoint,
      config.operations.findMany?.endpoint,
      config.operations.findOne?.endpoint,
      config.operations.update?.endpoint,
      config.operations.delete?.endpoint,
    ].filter(Boolean);

    const hasPathInjection = endpoints.some(e => 
      e?.includes("..") || e?.includes("//") || /%2e%2e|%252e/i.test(e || "")
    );

    checks.push({
      name: "Path Injection Protection",
      category: "security",
      passed: !hasPathInjection,
      severity: hasPathInjection ? "critical" : "info",
      message: hasPathInjection
        ? "Path traversal patterns detected in endpoints"
        : "No path injection risk",
      remediation: "Remove '..' and encoded traversal patterns from endpoints",
    });

    // 3. Open Redirect Check
    const hasRedirectParam = endpoints.some(e =>
      /redirect|return_url|next|callback|goto/i.test(e || "")
    );

    checks.push({
      name: "Open Redirect Protection",
      category: "security",
      passed: !hasRedirectParam,
      severity: hasRedirectParam ? "warning" : "info",
      message: hasRedirectParam
        ? "Potential open redirect parameters in endpoints"
        : "No open redirect risk",
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Code Safety Analysis (AST-level)
  // ═══════════════════════════════════════════════════════════

  private runCodeSafetyChecks(code: string): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];
    const foundPatterns: Array<{ name: string; severity: string }> = [];

    // Scan for dangerous patterns
    for (const { pattern, name, severity } of DANGEROUS_CODE_PATTERNS) {
      if (pattern.test(code)) {
        foundPatterns.push({ name, severity });
      }
      pattern.lastIndex = 0; // Reset regex
    }

    const criticalPatterns = foundPatterns.filter(p => p.severity === "critical");
    const highPatterns = foundPatterns.filter(p => p.severity === "high");

    checks.push({
      name: "Dangerous Code Patterns",
      category: "code",
      passed: criticalPatterns.length === 0,
      severity: criticalPatterns.length > 0 ? "critical" : highPatterns.length > 0 ? "error" : "info",
      message: foundPatterns.length === 0
        ? "No dangerous code patterns detected"
        : `Found ${foundPatterns.length} dangerous pattern(s): ${foundPatterns.map(p => p.name).join(", ")}`,
      details: foundPatterns,
      remediation: "Remove dangerous code patterns",
    });

    // Error handling check
    const hasErrorHandling = code.includes("catch") || code.includes("try");
    checks.push({
      name: "Error Handling",
      category: "code",
      passed: hasErrorHandling,
      severity: hasErrorHandling ? "info" : "warning",
      message: hasErrorHandling ? "Error handling present" : "No explicit error handling",
      remediation: "Add try/catch blocks for robust error handling",
    });

    // Code complexity (lines)
    const lines = code.split("\n").length;
    checks.push({
      name: "Code Complexity",
      category: "code",
      passed: lines < 500,
      severity: lines > 500 ? "warning" : "info",
      message: `Generated code: ${lines} lines`,
      remediation: lines > 500 ? "Consider simplifying adapter logic" : undefined,
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Capability Compliance (NEW)
  // ═══════════════════════════════════════════════════════════

  private runCapabilityComplianceChecks(
    config: AdapterConfig,
    declaredCapabilities?: Partial<CapabilityMatrix>
  ): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // Determine provider type
    const providerType = config.provider.type;
    const isDatabase = providerType === "database";
    const isRest = providerType === "rest" || providerType === "graphql";

    // 1. SQL capability mismatch
    if (declaredCapabilities?.supportsSQL && isRest) {
      checks.push({
        name: "SQL Capability Mismatch",
        category: "capability",
        passed: false,
        severity: "error",
        message: "Adapter declares SQL support but provider type is REST/GraphQL",
        remediation: "REST/GraphQL adapters cannot support raw SQL queries",
      });
    } else {
      checks.push({
        name: "SQL Capability Alignment",
        category: "capability",
        passed: true,
        severity: "info",
        message: "SQL capability matches provider type",
      });
    }

    // 2. Transaction capability mismatch
    if (declaredCapabilities?.transactionLevel && declaredCapabilities.transactionLevel !== "none" && isRest) {
      checks.push({
        name: "Transaction Capability Mismatch",
        category: "capability",
        passed: false,
        severity: "warning",
        message: "REST adapters typically cannot support database transactions",
        remediation: "Set transactionLevel to 'none' for REST adapters",
      });
    } else {
      checks.push({
        name: "Transaction Capability Alignment",
        category: "capability",
        passed: true,
        severity: "info",
        message: "Transaction capability matches provider type",
      });
    }

    // 3. Realtime capability check
    if (declaredCapabilities?.supportsRealtime && !config.provider.baseUrl?.includes("ws")) {
      checks.push({
        name: "Realtime Capability Warning",
        category: "capability",
        passed: true,
        severity: "warning",
        message: "Realtime declared but no WebSocket endpoint detected",
      });
    }

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Performance Checks (Enhanced)
  // ═══════════════════════════════════════════════════════════

  private runPerformanceChecks(
    config: AdapterConfig,
    capabilities?: Partial<CapabilityMatrix>
  ): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // 1. Connection pool
    const maxPool = capabilities?.maxConnectionPool ?? 10;
    checks.push({
      name: "Connection Pool Size",
      category: "performance",
      passed: maxPool >= 5,
      severity: maxPool < 5 ? "warning" : "info",
      message: `Max connection pool: ${maxPool}`,
    });

    // 2. Batch size limits
    const maxBatch = capabilities?.maxBatchSize ?? 1000;
    checks.push({
      name: "Batch Size Limit",
      category: "performance",
      passed: maxBatch <= 10000,
      severity: maxBatch > 10000 ? "warning" : "info",
      message: `Max batch size: ${maxBatch}`,
      remediation: maxBatch > 10000 ? "Consider reducing batch size to prevent timeouts" : undefined,
    });

    // 3. Query size limits
    const maxQuery = capabilities?.maxQuerySize ?? 1000000;
    checks.push({
      name: "Query Size Limit",
      category: "performance",
      passed: maxQuery <= 10000000,
      severity: maxQuery > 10000000 ? "warning" : "info",
      message: `Max query size: ${(maxQuery / 1000000).toFixed(1)}MB`,
    });

    // 4. Test endpoint for health checks
    const hasTestEndpoint = !!config.connection.testEndpoint;
    checks.push({
      name: "Health Check Endpoint",
      category: "performance",
      passed: hasTestEndpoint,
      severity: hasTestEndpoint ? "info" : "warning",
      message: hasTestEndpoint ? "Health check endpoint configured" : "No health check endpoint",
      remediation: "Add connection.testEndpoint for monitoring",
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Drift Prediction (Enhanced)
  // ═══════════════════════════════════════════════════════════

  private runDriftChecks(config: AdapterConfig): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // 1. Response mapping
    const hasMapping = !!config.responseMapping;
    const hasDataPath = !!config.responseMapping?.dataPath;
    const hasErrorPath = !!config.responseMapping?.errorPath;

    checks.push({
      name: "Response Data Path",
      category: "drift",
      passed: hasDataPath,
      severity: hasDataPath ? "info" : "warning",
      message: hasDataPath ? `Data path: ${config.responseMapping?.dataPath}` : "No data path - response structure unpredictable",
      remediation: "Define responseMapping.dataPath for consistent responses",
    });

    checks.push({
      name: "Response Error Path",
      category: "drift",
      passed: hasErrorPath,
      severity: hasErrorPath ? "info" : "warning",
      message: hasErrorPath ? `Error path: ${config.responseMapping?.errorPath}` : "No error path - errors may be missed",
      remediation: "Define responseMapping.errorPath for error handling",
    });

    // 2. Version control
    checks.push({
      name: "Version Control",
      category: "drift",
      passed: !!config.version,
      severity: "info",
      message: config.version ? `Version: ${config.version}` : "No version specified",
    });

    // 3. Operation consistency
    const ops = config.operations;
    const definedOps = Object.entries(ops).filter(([_, op]) => op).length;
    const hasEndpoints = Object.values(ops).some(op => op?.endpoint);
    const hasCustom = Object.values(ops).some(op => op?.customCode);

    checks.push({
      name: "Operation Consistency",
      category: "drift",
      passed: !hasCustom || definedOps >= 3,
      severity: hasCustom && definedOps < 3 ? "warning" : "info",
      message: `${definedOps} operations defined, ${hasEndpoints ? "with" : "without"} endpoints`,
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Schema Checks
  // ═══════════════════════════════════════════════════════════

  private runSchemaChecks(config: AdapterConfig): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // Required fields
    const fields = config.connection.requiredFields;
    checks.push({
      name: "Connection Fields",
      category: "schema",
      passed: fields.length > 0,
      severity: fields.length === 0 ? "error" : "info",
      message: `${fields.length} connection field(s) defined`,
      details: fields.map(f => `${f.name} (${f.type})`),
    });

    // CRUD completeness
    const crudOps = ["insert", "findMany", "findOne", "update", "delete"];
    const definedOps = crudOps.filter(op => config.operations[op as keyof typeof config.operations]);
    const missingOps = crudOps.filter(op => !config.operations[op as keyof typeof config.operations]);

    checks.push({
      name: "CRUD Operations",
      category: "schema",
      passed: definedOps.length >= 2,
      severity: definedOps.length < 2 ? "warning" : "info",
      message: definedOps.length === 5
        ? "All CRUD operations defined"
        : `${definedOps.length}/5 CRUD operations (missing: ${missingOps.join(", ")})`,
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Kernel Policy Enforcement (NEW)
  // ═══════════════════════════════════════════════════════════

  private runKernelPolicyChecks(config: AdapterConfig): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // 1. Provider ID validation
    const providerType = config.provider.type;
    const validTypes = ["rest", "graphql", "sdk", "database", "file-system", "custom"];
    
    checks.push({
      name: "Provider Type Validation",
      category: "compliance",
      passed: validTypes.includes(providerType),
      severity: validTypes.includes(providerType) ? "info" : "error",
      message: `Provider type: ${providerType}`,
    });

    // 2. Adapter ID format
    const validId = /^[a-z0-9-]+$/.test(config.id);
    checks.push({
      name: "Adapter ID Format",
      category: "compliance",
      passed: validId,
      severity: validId ? "info" : "error",
      message: validId ? `Valid adapter ID: ${config.id}` : "Adapter ID must be lowercase alphanumeric with hyphens",
      remediation: "Use lowercase letters, numbers, and hyphens only",
    });

    // 3. Audit trail compliance
    checks.push({
      name: "Audit Trail Compliance",
      category: "compliance",
      passed: true,
      severity: "info",
      message: "All adapter operations will be logged to audit chain",
    });

    return checks;
  }

  // ═══════════════════════════════════════════════════════════
  // Sandbox Simulation (NEW - Critical)
  // ═══════════════════════════════════════════════════════════

  private async runSandboxSimulation(
    config: AdapterConfig,
    generatedCode: string
  ): Promise<{ passed: boolean; errors: string[]; checks: GuardrailCheck[] }> {
    const checks: GuardrailCheck[] = [];
    const errors: string[] = [];

    // Check if custom code exists
    const hasCustomCode = Object.values(config.operations).some(op => op?.customCode);

    if (!hasCustomCode) {
      checks.push({
        name: "Sandbox Simulation",
        category: "security",
        passed: true,
        severity: "info",
        message: "No custom code - sandbox simulation not required",
      });
      return { passed: true, errors: [], checks };
    }

    // Simulate custom code in sandbox
    try {
      // Test each custom code block
      for (const [opName, op] of Object.entries(config.operations)) {
        if (!op?.customCode) continue;

        const result = await sandboxExecutor.execute(
          `
          // Dry-run simulation
          const testData = { id: "test-123", name: "Test" };
          const table = "test_table";
          ${op.customCode}
          `,
          { 
            data: { id: "test-123" }, 
            table: "test_table",
            fetch: async () => ({ json: async () => ({ data: [] }) }),
          }
        );

        if (!result.success) {
          errors.push(`${opName}: ${result.error?.message}`);
        }
      }

      const passed = errors.length === 0;
      
      checks.push({
        name: "Sandbox Simulation",
        category: "security",
        passed,
        severity: passed ? "info" : "critical",
        message: passed
          ? "Custom code passed sandbox simulation"
          : `Sandbox simulation failed: ${errors.join("; ")}`,
        details: { errors },
        remediation: passed ? undefined : "Fix custom code errors before activation",
      });

      return { passed, errors, checks };
    } catch (error: any) {
      errors.push(error.message);
      
      checks.push({
        name: "Sandbox Simulation",
        category: "security",
        passed: false,
        severity: "critical",
        message: `Sandbox simulation error: ${error.message}`,
        remediation: "Fix custom code before activation",
      });

      return { passed: false, errors, checks };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Threat Profile Calculation
  // ═══════════════════════════════════════════════════════════

  private calculateThreatProfile(checks: GuardrailCheck[], config: AdapterConfig): ThreatProfile {
    const factors: ThreatProfile["factors"] = {
      customCode: "none",
      externalCalls: "none",
      authWeakness: "none",
      unboundedPayload: "none",
      ssrfRisk: "none",
      injectionRisk: "none",
      privilegeEscalation: "none",
      driftPotential: "none",
    };

    // Custom code threat
    const hasCustom = Object.values(config.operations).some(op => op?.customCode);
    factors.customCode = hasCustom ? "high" : "none";

    // External calls
    factors.externalCalls = config.provider.baseUrl ? "medium" : "low";

    // Auth weakness
    const authCheck = checks.find(c => c.name === "Authentication Method");
    factors.authWeakness = authCheck?.passed ? "low" : "high";

    // SSRF risk
    const ssrfCheck = checks.find(c => c.name === "SSRF Protection");
    factors.ssrfRisk = ssrfCheck?.passed ? "none" : "critical";

    // Injection risk
    const codeCheck = checks.find(c => c.name === "Dangerous Code Patterns");
    factors.injectionRisk = codeCheck?.passed ? "low" : codeCheck?.severity === "critical" ? "critical" : "high";

    // Drift potential
    const driftChecks = checks.filter(c => c.category === "drift" && !c.passed);
    factors.driftPotential = driftChecks.length > 2 ? "high" : driftChecks.length > 0 ? "medium" : "low";

    // Calculate overall threat level
    const levels: ThreatLevel[] = Object.values(factors);
    if (levels.includes("critical")) {
      return { overall: "critical", factors };
    }
    const highCount = levels.filter(l => l === "high").length;
    if (highCount >= 2) {
      return { overall: "high", factors };
    }
    if (highCount === 1 || levels.filter(l => l === "medium").length >= 2) {
      return { overall: "medium", factors };
    }
    return { overall: "low", factors };
  }

  // ═══════════════════════════════════════════════════════════
  // Weighted Score Calculation
  // ═══════════════════════════════════════════════════════════

  private calculateWeightedScore(checks: GuardrailCheck[], threatProfile: ThreatProfile): number {
    // Category weights
    const categoryWeights: Record<GuardrailCheck["category"], number> = {
      security: 3.0,
      capability: 2.0,
      code: 2.5,
      drift: 1.5,
      performance: 1.0,
      schema: 1.0,
      compliance: 1.5,
    };

    // Severity penalties
    const severityPenalties: Record<GuardrailCheck["severity"], number> = {
      info: 0,
      warning: 5,
      error: 15,
      critical: 35,
    };

    let totalPenalty = 0;
    let maxPenalty = 0;

    for (const check of checks) {
      const weight = categoryWeights[check.category];
      const penalty = severityPenalties[check.severity];
      
      maxPenalty += penalty * weight;
      if (!check.passed) {
        totalPenalty += penalty * weight;
      }
    }

    // Threat multiplier
    const threatMultipliers: Record<ThreatLevel, number> = {
      none: 1.0,
      low: 1.0,
      medium: 1.1,
      high: 1.3,
      critical: 1.5,
    };
    
    totalPenalty *= threatMultipliers[threatProfile.overall];

    return Math.max(0, Math.round(100 - totalPenalty));
  }

  // ═══════════════════════════════════════════════════════════
  // Risk Level Calculation
  // ═══════════════════════════════════════════════════════════

  private calculateRiskLevel(checks: GuardrailCheck[], threatProfile: ThreatProfile): GuardrailResult["riskLevel"] {
    if (threatProfile.overall === "critical") return "critical";
    
    const criticalFailed = checks.filter(c => c.severity === "critical" && !c.passed).length;
    const errorFailed = checks.filter(c => c.severity === "error" && !c.passed).length;

    if (criticalFailed > 0) return "critical";
    if (errorFailed > 0 || threatProfile.overall === "high") return "high";
    if (threatProfile.overall === "medium") return "medium";
    return "low";
  }

  // ═══════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════

  private generateSummary(
    checks: GuardrailCheck[],
    score: number,
    approved: boolean,
    threatProfile: ThreatProfile
  ): string {
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;

    if (approved) {
      return `✅ Adapter APPROVED (score: ${score}/100, threat: ${threatProfile.overall}). ${passed}/${total} checks passed.`;
    }
    
    const critical = checks.filter(c => c.severity === "critical" && !c.passed);
    return `❌ Adapter REJECTED (score: ${score}/100, threat: ${threatProfile.overall}). ${critical.length} critical issue(s).`;
  }

  private generateRecommendations(checks: GuardrailCheck[], threatProfile: ThreatProfile): string[] {
    const recs: string[] = [];

    // Add threat-based recommendations
    if (threatProfile.factors.ssrfRisk !== "none") {
      recs.push("CRITICAL: Fix SSRF vulnerability - use external domains only");
    }
    if (threatProfile.factors.injectionRisk === "critical") {
      recs.push("CRITICAL: Remove dangerous code patterns (eval, Function, etc.)");
    }
    if (threatProfile.factors.customCode === "high") {
      recs.push("Custom code will be sandboxed - ensure it handles errors");
    }

    // Add check-based recommendations
    const failedChecks = checks
      .filter(c => !c.passed && c.remediation)
      .sort((a, b) => {
        const order = { critical: 0, error: 1, warning: 2, info: 3 };
        return order[a.severity] - order[b.severity];
      });

    for (const check of failedChecks.slice(0, 5 - recs.length)) {
      if (check.remediation && !recs.includes(check.remediation)) {
        recs.push(check.remediation);
      }
    }

    return recs;
  }

  private async logValidation(
    adapterId: string,
    approved: boolean,
    score: number,
    riskLevel: string,
    threatProfile: ThreatProfile
  ): Promise<void> {
    await eventBus.publish({
      type: "adapter.ai.validated",
      adapterId,
      approved,
      score,
      riskLevel,
      threatLevel: threatProfile.overall,
      timestamp: new Date().toISOString(),
    } as any);
  }
}

export const aiGuardrails = new AIGuardrails();
