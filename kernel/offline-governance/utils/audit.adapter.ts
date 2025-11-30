/**
 * Audit Adapter for Offline Governance
 * 
 * Wraps the existing audit logger with a cryptographic chain interface
 * for consistent usage across offline governance modules.
 */

import { auditLogger } from "../../audit/audit-logger";

export const auditChain = {
  async logEvent(eventData: {
    tenantId?: string;
    userId?: string;
    deviceId?: string;
    [key: string]: any;
  }): Promise<void> {
    const { tenantId, userId, ...details } = eventData;
    
    await auditLogger.log({
      tenantId: tenantId || null,
      subject: userId || null,
      action: details.action || "offline.governance.event",
      category: "security",
      severity: details.severity || "info",
      details,
    });
  },
};

