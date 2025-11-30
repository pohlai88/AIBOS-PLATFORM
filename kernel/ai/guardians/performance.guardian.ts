// ai/guardians/performance.guardian.ts
/**
 * Performance Guardian — Query Performance Guardian
 * 
 * Prevents AI from suggesting:
 * - SELECT * queries
 * - Full table scans
 * - Missing indexes
 * - N+1 query patterns
 * - Cartesian products
 * 
 * Uses regex-based SQL pattern detection
 */

import type { GuardianDecision, GovernanceContext } from "../governance.engine";

/**
 * SQL anti-patterns to detect
 */
const SQL_ANTI_PATTERNS = {
  SELECT_STAR: /select\s+\*/gi,
  NO_WHERE_CLAUSE: /select\s+.+\s+from\s+\w+\s*(?!where|limit|join)/gi,
  CARTESIAN_PRODUCT: /cross\s+join/gi,
  NESTED_SUBQUERY: /select\s+.+\s+from\s+\(.+select.+\)/gi,
  MISSING_LIMIT: /select\s+.+\s+from\s+(?!.*limit)/gi,
} as const;

export const performanceGuardian = {
  /**
   * Inspect query performance
   * 
   * @param action - Action ID
   * @param payload - Payload containing query
   * @param context - Governance context
   * @returns Guardian decision
   */
  async inspect(
    action: string,
    payload: unknown,
    context?: GovernanceContext
  ): Promise<GuardianDecision> {
    // Only inspect query-related actions
    if (!action.startsWith("query.") && !(payload as any)?.query) {
      return {
        guardian: "performance",
        status: "ALLOW",
        reason: "No query detected",
        timestamp: new Date(),
      };
    }

    const query = (payload as any)?.query as string;

    if (!query || typeof query !== "string") {
      return {
        guardian: "performance",
        status: "ALLOW",
        reason: "No SQL query found in payload",
        timestamp: new Date(),
      };
    }

    const sql = query.toLowerCase().trim();
    const issues: string[] = [];

    // --- Check 1: SELECT * queries ---
    if (SQL_ANTI_PATTERNS.SELECT_STAR.test(sql)) {
      return {
        guardian: "performance",
        status: "DENY",
        reason: "SELECT * queries are not allowed. Define fields explicitly for better performance.",
        details: { pattern: "SELECT_STAR", query },
        timestamp: new Date(),
      };
    }

    // --- Check 2: Missing WHERE clause on SELECT (potential full table scan) ---
    if (sql.includes("select") && !sql.includes("where") && !sql.includes("limit")) {
      // Allow for small utility queries
      const isCountQuery = sql.includes("count(*)");
      const hasJoin = sql.includes("join");

      if (!isCountQuery && !hasJoin) {
        issues.push("Missing WHERE clause — may trigger full table scan");
      }
    }

    // --- Check 3: Cartesian product (CROSS JOIN) ---
    if (SQL_ANTI_PATTERNS.CARTESIAN_PRODUCT.test(sql)) {
      return {
        guardian: "performance",
        status: "DENY",
        reason: "CROSS JOIN (Cartesian product) detected. Use INNER JOIN or LEFT JOIN with ON clause.",
        details: { pattern: "CARTESIAN_PRODUCT", query },
        timestamp: new Date(),
      };
    }

    // --- Check 4: Nested subqueries (performance killer) ---
    if (sql.match(/select.+from\s*\(.+select/gi)) {
      issues.push("Nested subquery detected — consider using JOINs or CTEs for better performance");
    }

    // --- Check 5: Missing LIMIT on large result sets ---
    if (sql.includes("select") && !sql.includes("limit") && !sql.includes("count(")) {
      issues.push("Missing LIMIT clause — unbounded result sets may cause memory issues");
    }

    // --- Check 6: N+1 query pattern (heuristic) ---
    if ((payload as any)?.queryCount && (payload as any).queryCount > 10) {
      issues.push(`High query count (${(payload as any).queryCount}) — possible N+1 query pattern`);
    }

    // --- Check 7: Unindexed field access (requires metadata) ---
    const unindexedPattern = /where\s+(\w+)\s*=/gi;
    const matches = sql.match(unindexedPattern);
    if (matches && matches.length > 0) {
      // TODO: Check against metadata registry for indexed fields
      // For now, just warn
      issues.push("WHERE clause detected — ensure fields are indexed for optimal performance");
    }

    // --- Check 8: Large IN clause ---
    const inClausePattern = /in\s*\([^)]{100,}\)/gi;
    if (inClausePattern.test(sql)) {
      issues.push("Large IN clause detected (>100 chars) — consider using temporary table or JOIN");
    }

    // --- Check 9: Multiple OR conditions (inefficient) ---
    const orCount = (sql.match(/\s+or\s+/gi) || []).length;
    if (orCount > 5) {
      issues.push(`Multiple OR conditions (${orCount}) — consider using IN clause or UNION`);
    }

    // --- Determine status ---
    if (issues.length === 0) {
      return {
        guardian: "performance",
        status: "ALLOW",
        reason: "Query performance validated successfully",
        timestamp: new Date(),
      };
    }

    if (issues.length <= 2) {
      return {
        guardian: "performance",
        status: "WARN",
        reason: `${issues.length} performance issue(s) detected`,
        details: { issues, query },
        timestamp: new Date(),
      };
    }

    return {
      guardian: "performance",
      status: "DENY",
      reason: `${issues.length} critical performance issues detected: ${issues.join("; ")}`,
      details: { issues, query },
      timestamp: new Date(),
    };
  },

  /**
   * Analyze query complexity
   * 
   * @param query - SQL query
   * @returns Complexity score (0-100)
   */
  analyzeComplexity(query: string): number {
    let score = 0;

    const sql = query.toLowerCase();

    // Subqueries add 20 points each
    const subqueryCount = (sql.match(/select.+from\s*\(/gi) || []).length;
    score += subqueryCount * 20;

    // JOINs add 10 points each
    const joinCount = (sql.match(/\s+join\s+/gi) || []).length;
    score += joinCount * 10;

    // OR conditions add 5 points each
    const orCount = (sql.match(/\s+or\s+/gi) || []).length;
    score += orCount * 5;

    // UNION adds 15 points
    if (sql.includes("union")) {
      score += 15;
    }

    // GROUP BY adds 10 points
    if (sql.includes("group by")) {
      score += 10;
    }

    // ORDER BY adds 5 points
    if (sql.includes("order by")) {
      score += 5;
    }

    return Math.min(score, 100);
  },
};

