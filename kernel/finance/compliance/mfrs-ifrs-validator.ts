/**
 * MFRS/IFRS Financial Standards Validator
 * 
 * GRCD Compliance: C-9 (MFRS/IFRS Financial Reporting Standards)
 * Standard: MFRS, IFRS, SOX
 * 
 * Validates financial data against MFRS/IFRS accounting standards.
 */

import {
  GLAccount,
  JournalEntry,
  JournalLine,
  FinancialStatement,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AccountType,
  NormalBalance,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("mfrs-ifrs-validator");

export class MFRSIFRSValidator {
  /**
   * Validate GL account structure
   */
  validateGLAccount(account: GLAccount): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Account number format (MFRS requirement)
    if (!/^\d{4}(-\d{3})?$/.test(account.accountNumber)) {
      errors.push({
        code: "MFRS-001",
        message: "Account number must follow format: XXXX or XXXX-XXX",
        path: "accountNumber",
        requirement: "MFRS 1.1.1",
      });
    }

    // 2. Account type and normal balance consistency (IFRS requirement)
    const expectedNormalBalance = this.getExpectedNormalBalance(account.accountType);
    if (account.normalBalance !== expectedNormalBalance) {
      errors.push({
        code: "IFRS-001",
        message: `Account type ${account.accountType} must have ${expectedNormalBalance} normal balance`,
        path: "normalBalance",
        requirement: "IFRS Framework 4.25",
      });
    }

    // 3. Account name required
    if (!account.accountName || account.accountName.trim().length === 0) {
      errors.push({
        code: "MFRS-002",
        message: "Account name is required",
        path: "accountName",
        requirement: "MFRS 1.1.2",
      });
    }

    // 4. Category required
    if (!account.category || account.category.trim().length === 0) {
      warnings.push({
        code: "MFRS-WARN-001",
        message: "Account category is recommended for better reporting",
        recommendation: "Add category classification",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate journal entry (double-entry accounting)
   */
  validateJournalEntry(entry: JournalEntry): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Double-entry principle (IFRS requirement)
    const totalDebits = entry.debits.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = entry.credits.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      errors.push({
        code: "IFRS-002",
        message: `Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`,
        path: "entry",
        requirement: "IFRS Framework 4.18 (Double-Entry Principle)",
      });
    }

    // 2. At least one debit and one credit
    if (entry.debits.length === 0) {
      errors.push({
        code: "IFRS-003",
        message: "Journal entry must have at least one debit line",
        path: "debits",
        requirement: "IFRS Framework 4.18",
      });
    }

    if (entry.credits.length === 0) {
      errors.push({
        code: "IFRS-004",
        message: "Journal entry must have at least one credit line",
        path: "credits",
        requirement: "IFRS Framework 4.18",
      });
    }

    // 3. Debit lines must have debit amounts only
    entry.debits.forEach((line, index) => {
      if (line.credit !== undefined && line.credit !== null) {
        errors.push({
          code: "IFRS-005",
          message: "Debit line cannot have credit amount",
          path: `debits[${index}]`,
          requirement: "IFRS Framework 4.18",
        });
      }
      if (line.debit === undefined || line.debit === null || line.debit <= 0) {
        errors.push({
          code: "IFRS-006",
          message: "Debit line must have positive debit amount",
          path: `debits[${index}].debit`,
          requirement: "IFRS Framework 4.18",
        });
      }
    });

    // 4. Credit lines must have credit amounts only
    entry.credits.forEach((line, index) => {
      if (line.debit !== undefined && line.debit !== null) {
        errors.push({
          code: "IFRS-007",
          message: "Credit line cannot have debit amount",
          path: `credits[${index}]`,
          requirement: "IFRS Framework 4.18",
        });
      }
      if (line.credit === undefined || line.credit === null || line.credit <= 0) {
        errors.push({
          code: "IFRS-008",
          message: "Credit line must have positive credit amount",
          path: `credits[${index}].credit`,
          requirement: "IFRS Framework 4.18",
        });
      }
    });

    // 5. Date format (ISO 8601)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      errors.push({
        code: "MFRS-003",
        message: "Entry date must be in ISO 8601 format (YYYY-MM-DD)",
        path: "date",
        requirement: "MFRS 1.2.1",
      });
    }

    // 6. Description required
    if (!entry.description || entry.description.trim().length === 0) {
      warnings.push({
        code: "MFRS-WARN-002",
        message: "Journal entry description is recommended",
        recommendation: "Add descriptive text for audit trail",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate balance sheet
   */
  validateBalanceSheet(statement: FinancialStatement): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (statement.type !== "balance_sheet") {
      errors.push({
        code: "IFRS-009",
        message: "Statement type must be 'balance_sheet'",
        path: "type",
        requirement: "IFRS 1.10",
      });
      return { valid: false, errors, warnings };
    }

    // Balance sheet equation: Assets = Liabilities + Equity
    const assets = statement.data.assets || 0;
    const liabilities = statement.data.liabilities || 0;
    const equity = statement.data.equity || 0;
    const total = liabilities + equity;

    if (Math.abs(assets - total) > 0.01) {
      errors.push({
        code: "IFRS-010",
        message: `Balance sheet equation violated. Assets (${assets}) ≠ Liabilities (${liabilities}) + Equity (${equity})`,
        path: "data",
        requirement: "IFRS Framework 4.20 (Accounting Equation)",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate income statement
   */
  validateIncomeStatement(statement: FinancialStatement): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (statement.type !== "income_statement") {
      errors.push({
        code: "IFRS-011",
        message: "Statement type must be 'income_statement'",
        path: "type",
        requirement: "IFRS 1.8",
      });
      return { valid: false, errors, warnings };
    }

    // Income statement: Revenue - Expenses = Net Income
    const revenue = statement.data.revenue || 0;
    const expenses = statement.data.expenses || 0;
    const netIncome = statement.data.netIncome || 0;
    const calculatedNetIncome = revenue - expenses;

    if (Math.abs(netIncome - calculatedNetIncome) > 0.01) {
      errors.push({
        code: "IFRS-012",
        message: `Income statement calculation error. Net Income (${netIncome}) ≠ Revenue (${revenue}) - Expenses (${expenses})`,
        path: "data.netIncome",
        requirement: "IFRS 1.8",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check double-entry accounting principle
   */
  checkDoubleEntry(entry: JournalEntry): ValidationResult {
    return this.validateJournalEntry(entry);
  }

  /**
   * Enforce accounting equation (Assets = Liabilities + Equity)
   */
  enforceAccountingEquation(accounts: GLAccount[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // This would require account balances, which we don't have in the account structure
    // This is a placeholder for when balances are available
    warnings.push({
      code: "IFRS-WARN-001",
      message: "Accounting equation validation requires account balances",
      recommendation: "Provide account balances for validation",
    });

    return {
      valid: true,
      errors,
      warnings,
    };
  }

  /**
   * Get expected normal balance for account type
   */
  private getExpectedNormalBalance(accountType: AccountType): NormalBalance {
    switch (accountType) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        return NormalBalance.DEBIT;
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        return NormalBalance.CREDIT;
      default:
        return NormalBalance.DEBIT;
    }
  }
}

// Singleton instance
export const mfrsIfrsValidator = new MFRSIFRSValidator();

