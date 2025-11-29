// jobs/audit-chain-verification.job.ts
import { schedule } from "node-cron";
import { verifyAuditChain } from "../audit/hash-chain.store";
import { kernelContainer } from "../core/container";
import { eventBus } from "../events/event-bus";
import { baseLogger } from "../observability/logger";

interface VerificationResult {
  tenantId: string;
  valid: boolean;
  errorCount: number;
  errors: string[];
  verifiedAt: Date;
}

/**
 * Verify all tenant audit chains
 * Runs nightly at 2 AM
 */
export async function runAuditChainVerification(): Promise<
  VerificationResult[]
> {
  const db = await kernelContainer.getDatabase();

  // Get all tenants with audit entries
  const tenants = await db.query<{ tenant_id: string }>(
    `SELECT DISTINCT tenant_id FROM kernel_audit_log`
  );

  const results: VerificationResult[] = [];

  for (const { tenant_id } of tenants) {
    const result = await verifyAuditChain(tenant_id);

    const verificationResult: VerificationResult = {
      tenantId: tenant_id,
      valid: result.valid,
      errorCount: result.errors.length,
      errors: result.errors,
      verifiedAt: new Date(),
    };

    results.push(verificationResult);

    // Emit event for monitoring
    await eventBus.publish("audit.chain.verified", verificationResult);

    // Log critical failures
    if (!result.valid) {
      baseLogger.error(
        { tenantId: tenant_id, errors: result.errors },
        "[CRITICAL] Audit chain integrity failure for tenant %s",
        tenant_id
      );

      // Send alert (integrate with your alerting system)
      await sendSecurityAlert({
        severity: "CRITICAL",
        title: `Audit Chain Tampered: ${tenant_id}`,
        message: `${result.errors.length} integrity violations detected`,
        errors: result.errors,
      });
    } else {
      const chainLength = await getChainLength(tenant_id);
      baseLogger.info(
        { tenantId: tenant_id, chainLength },
        "[OK] Audit chain verified for tenant %s (%d entries)",
        tenant_id,
        chainLength
      );
    }
  }

  return results;
}

async function getChainLength(tenantId: string): Promise<number> {
  const db = await kernelContainer.getDatabase();
  const [{ count }] = await db.query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM kernel_audit_log WHERE tenant_id = $1`,
    [tenantId]
  );
  return count;
}

async function sendSecurityAlert(alert: {
  severity: string;
  title: string;
  message: string;
  errors: string[];
}): Promise<void> {
  // TODO: Integrate with PagerDuty, Slack, Email, etc.
  baseLogger.error({ alert }, "[SECURITY ALERT] %s", alert.title);
}

/**
 * Start the nightly verification job
 * Runs every day at 2:00 AM
 */
export function startAuditVerificationJob() {
  // Run at 2 AM every day
  schedule("0 2 * * *", async () => {
    baseLogger.info("[AuditVerification] Starting nightly verification...");
    try {
      const results = await runAuditChainVerification();
      const failures = results.filter((r) => !r.valid);

      baseLogger.info(
        { total: results.length, failures: failures.length },
        "[AuditVerification] Completed: %d tenants verified, %d failures",
        results.length,
        failures.length
      );
    } catch (error) {
      baseLogger.error({ error }, "[AuditVerification] Job failed");
    }
  });

  baseLogger.info("[AuditVerification] Scheduled nightly job at 2:00 AM");
}

