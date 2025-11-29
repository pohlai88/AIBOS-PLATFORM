/**
 * Chart of Accounts Manager
 * 
 * GRCD Compliance: C-9 (MFRS/IFRS Financial Reporting Standards)
 * Standard: MFRS, IFRS
 * 
 * Manages and validates chart of accounts structure.
 */

import { GLAccount, ValidationResult, ValidationError } from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("chart-of-accounts");

export class ChartOfAccounts {
  private accounts: Map<string, GLAccount> = new Map();

  /**
   * Add account to chart
   */
  addAccount(account: GLAccount): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate account structure
    if (!this.validateAccountStructure(account).valid) {
      return this.validateAccountStructure(account);
    }

    // Check for duplicates
    if (this.accounts.has(account.accountNumber)) {
      errors.push({
        code: "COA-001",
        message: `Account number ${account.accountNumber} already exists`,
        path: "accountNumber",
      });
      return { valid: false, errors, warnings: [] };
    }

    // Validate parent account exists (if specified)
    if (account.parentAccount) {
      if (!this.accounts.has(account.parentAccount)) {
        errors.push({
          code: "COA-002",
          message: `Parent account ${account.parentAccount} does not exist`,
          path: "parentAccount",
        });
        return { valid: false, errors, warnings: [] };
      }
    }

    // Add account
    this.accounts.set(account.accountNumber, account);

    logger.info("Account added to chart of accounts", {
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.accountType,
    });

    return { valid: true, errors: [], warnings: [] };
  }

  /**
   * Get account by number
   */
  getAccount(accountNumber: string): GLAccount | null {
    return this.accounts.get(accountNumber) || null;
  }

  /**
   * Get account hierarchy
   */
  getAccountHierarchy(accountNumber: string): GLAccount[] {
    const hierarchy: GLAccount[] = [];
    let current = this.accounts.get(accountNumber);

    while (current) {
      hierarchy.unshift(current);
      current = current.parentAccount ? this.accounts.get(current.parentAccount) || null : null;
    }

    return hierarchy;
  }

  /**
   * Validate account structure
   */
  validateAccountStructure(account: GLAccount): ValidationResult {
    const errors: ValidationError[] = [];

    // Account number format
    if (!/^\d{4}(-\d{3})?$/.test(account.accountNumber)) {
      errors.push({
        code: "COA-003",
        message: "Account number must follow format: XXXX or XXXX-XXX",
        path: "accountNumber",
      });
    }

    // Account name required
    if (!account.accountName || account.accountName.trim().length === 0) {
      errors.push({
        code: "COA-004",
        message: "Account name is required",
        path: "accountName",
      });
    }

    // Account type required
    if (!account.accountType) {
      errors.push({
        code: "COA-005",
        message: "Account type is required",
        path: "accountType",
      });
    }

    // Normal balance required
    if (!account.normalBalance) {
      errors.push({
        code: "COA-006",
        message: "Normal balance is required",
        path: "normalBalance",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Enforce account naming convention
   */
  enforceAccountNamingConvention(account: GLAccount): boolean {
    // Basic naming convention: should be descriptive, not too short
    if (!account.accountName || account.accountName.length < 3) {
      return false;
    }

    // Should not contain special characters (except spaces, hyphens)
    if (!/^[a-zA-Z0-9\s\-]+$/.test(account.accountName)) {
      return false;
    }

    return true;
  }

  /**
   * List all accounts
   */
  listAccounts(): GLAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * List accounts by type
   */
  listAccountsByType(accountType: string): GLAccount[] {
    return Array.from(this.accounts.values()).filter((acc) => acc.accountType === accountType);
  }

  /**
   * Get account count
   */
  getAccountCount(): number {
    return this.accounts.size;
  }
}

// Singleton instance
export const chartOfAccounts = new ChartOfAccounts();

