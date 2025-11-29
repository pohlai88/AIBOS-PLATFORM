// ai/guardians/compliance.guardian.ts
/**
 * Compliance Guardian — Regulatory Compliance Guardian
 * 
 * Prevents AI from violating:
 * - GDPR (EU General Data Protection Regulation)
 * - SOX (Sarbanes-Oxley Act)
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - PCI-DSS (Payment Card Industry Data Security Standard)
 * - PDPA (Personal Data Protection Act)
 * 
 * Blocks access to PII without explicit approval
 */

import type { GuardianDecision, GovernanceContext } from "../governance.engine";

/**
 * PII (Personally Identifiable Information) fields
 */
const PII_FIELDS = new Set([
  // Email
  "email",
  "email_address",
  "user_email",
  
  // National ID / SSN
  "ic_number",
  "nric",
  "ssn",
  "social_security_number",
  "national_id",
  
  // Phone
  "phone",
  "phone_number",
  "mobile",
  "mobile_number",
  "tel",
  
  // Address
  "address",
  "street_address",
  "home_address",
  "billing_address",
  "shipping_address",
  
  // Payment
  "credit_card",
  "cc_number",
  "card_number",
  "cvv",
  "bank_account",
  
  // Personal Info
  "date_of_birth",
  "dob",
  "passport_number",
  "drivers_license",
  
  // Health
  "medical_record",
  "diagnosis",
  "prescription",
]);

/**
 * Sensitive financial fields (SOX compliance)
 */
const FINANCIAL_FIELDS = new Set([
  "revenue",
  "profit",
  "loss",
  "salary",
  "compensation",
  "bonus",
  "stock_options",
  "bank_balance",
]);

export const complianceGuardian = {
  /**
   * Inspect data access for compliance
   * 
   * @param action - Action ID
   * @param payload - Payload containing data access request
   * @param context - Governance context
   * @returns Guardian decision
   */
  async inspect(
    action: string,
    payload: unknown,
    context?: GovernanceContext
  ): Promise<GuardianDecision> {
    // Only inspect data access actions
    if (!action.startsWith("data.") && !(payload as any)?.dataAccess) {
      return {
        guardian: "compliance",
        status: "ALLOW",
        reason: "No data access detected",
        timestamp: new Date(),
      };
    }

    const dataAccess = (payload as any)?.dataAccess as {
      entity?: string;
      fields?: string[];
      purpose?: string;
      approved?: boolean;
    };

    if (!dataAccess) {
      return {
        guardian: "compliance",
        status: "ALLOW",
        reason: "No data access request found",
        timestamp: new Date(),
      };
    }

    const { entity, fields = [], purpose, approved = false } = dataAccess;

    // --- Check 1: PII access ---
    const piiFields = fields.filter((field) =>
      PII_FIELDS.has(field.toLowerCase())
    );

    if (piiFields.length > 0 && !approved) {
      return {
        guardian: "compliance",
        status: "DENY",
        reason: `PII access detected without approval: ${piiFields.join(", ")}. Explicit approval required for GDPR/PDPA compliance.`,
        details: {
          piiFields,
          entity,
          purpose,
          regulation: "GDPR/PDPA",
        },
        timestamp: new Date(),
      };
    }

    // --- Check 2: Financial data (SOX compliance) ---
    const financialFields = fields.filter((field) =>
      FINANCIAL_FIELDS.has(field.toLowerCase())
    );

    if (financialFields.length > 0 && !purpose) {
      return {
        guardian: "compliance",
        status: "WARN",
        reason: `Financial data access detected without stated purpose: ${financialFields.join(", ")}. SOX compliance requires audit trail.`,
        details: {
          financialFields,
          entity,
          regulation: "SOX",
        },
        timestamp: new Date(),
      };
    }

    // --- Check 3: Health data (HIPAA compliance) ---
    const healthFields = fields.filter((field) =>
      field.toLowerCase().includes("medical") ||
      field.toLowerCase().includes("health") ||
      field.toLowerCase().includes("diagnosis")
    );

    if (healthFields.length > 0 && !approved) {
      return {
        guardian: "compliance",
        status: "DENY",
        reason: `Protected health information (PHI) access detected: ${healthFields.join(", ")}. HIPAA authorization required.`,
        details: {
          healthFields,
          entity,
          regulation: "HIPAA",
        },
        timestamp: new Date(),
      };
    }

    // --- Check 4: Payment card data (PCI-DSS compliance) ---
    const paymentFields = fields.filter((field) =>
      field.toLowerCase().includes("credit_card") ||
      field.toLowerCase().includes("cc_") ||
      field.toLowerCase().includes("cvv")
    );

    if (paymentFields.length > 0) {
      return {
        guardian: "compliance",
        status: "DENY",
        reason: `Payment card data access detected: ${paymentFields.join(", ")}. PCI-DSS Level 1 compliance required.`,
        details: {
          paymentFields,
          entity,
          regulation: "PCI-DSS",
        },
        timestamp: new Date(),
      };
    }

    // --- Check 5: Cross-tenant data access ---
    if (context?.tenantId && (payload as any)?.targetTenantId) {
      const targetTenantId = (payload as any).targetTenantId;
      if (targetTenantId !== context.tenantId) {
        return {
          guardian: "compliance",
          status: "DENY",
          reason: `Cross-tenant data access detected: tenant '${context.tenantId}' attempting to access data from tenant '${targetTenantId}'`,
          details: {
            sourceTenant: context.tenantId,
            targetTenant: targetTenantId,
          },
          timestamp: new Date(),
        };
      }
    }

    // --- Check 6: Data retention (GDPR right to be forgotten) ---
    if (action === "data.delete" && (payload as any)?.rightToBeForgotten) {
      // Ensure all related data is deleted
      if (!(payload as any)?.cascadeDelete) {
        return {
          guardian: "compliance",
          status: "WARN",
          reason: "GDPR right to be forgotten requires cascade delete to remove all related data",
          details: {
            regulation: "GDPR",
            recommendation: "Enable cascade delete to ensure complete data removal",
          },
          timestamp: new Date(),
        };
      }
    }

    // All checks passed
    return {
      guardian: "compliance",
      status: "ALLOW",
      reason: "Data access complies with all regulatory requirements",
      details: {
        entity,
        fields,
        purpose,
      },
      timestamp: new Date(),
    };
  },

  /**
   * Check if a field is PII
   * 
   * @param fieldName - Field name
   * @returns True if PII
   */
  isPII(fieldName: string): boolean {
    return PII_FIELDS.has(fieldName.toLowerCase());
  },

  /**
   * Check if a field is financial data
   * 
   * @param fieldName - Field name
   * @returns True if financial
   */
  isFinancial(fieldName: string): boolean {
    return FINANCIAL_FIELDS.has(fieldName.toLowerCase());
  },

  /**
   * Get compliance requirements for a field
   * 
   * @param fieldName - Field name
   * @returns Applicable regulations
   */
  getRegulations(fieldName: string): string[] {
    const regulations: string[] = [];

    if (this.isPII(fieldName)) {
      regulations.push("GDPR", "PDPA");
    }

    if (this.isFinancial(fieldName)) {
      regulations.push("SOX");
    }

    if (
      fieldName.toLowerCase().includes("medical") ||
      fieldName.toLowerCase().includes("health")
    ) {
      regulations.push("HIPAA");
    }

    if (
      fieldName.toLowerCase().includes("credit_card") ||
      fieldName.toLowerCase().includes("payment")
    ) {
      regulations.push("PCI-DSS");
    }

    return regulations;
  },
};

