/**
 * Financial Compliance Types
 * 
 * GRCD Compliance: C-9 (MFRS/IFRS Financial Reporting Standards)
 * Standard: MFRS, IFRS, SOX
 * 
 * Defines types for financial reporting compliance.
 */

export enum AccountType {
  /** Assets */
  ASSET = "asset",
  
  /** Liabilities */
  LIABILITY = "liability",
  
  /** Equity */
  EQUITY = "equity",
  
  /** Revenue */
  REVENUE = "revenue",
  
  /** Expense */
  EXPENSE = "expense",
}

export enum NormalBalance {
  /** Debit balance */
  DEBIT = "debit",
  
  /** Credit balance */
  CREDIT = "credit",
}

export interface GLAccount {
  /** Account number (e.g., "1000", "4000-001") */
  accountNumber: string;
  
  /** Account name */
  accountName: string;
  
  /** Account type */
  accountType: AccountType;
  
  /** Account category */
  category: string;
  
  /** Subcategory */
  subcategory?: string;
  
  /** Normal balance (debit or credit) */
  normalBalance: NormalBalance;
  
  /** Parent account (for hierarchy) */
  parentAccount?: string;
  
  /** Is this account active? */
  active: boolean;
  
  /** Account description */
  description?: string;
}

export interface JournalLine {
  /** Account number */
  accountNumber: string;
  
  /** Debit amount (null if credit) */
  debit?: number;
  
  /** Credit amount (null if debit) */
  credit?: number;
  
  /** Line description */
  description: string;
  
  /** Reference (optional) */
  reference?: string;
}

export interface JournalEntry {
  /** Entry ID */
  id: string;
  
  /** Entry date (ISO 8601) */
  date: string;
  
  /** Entry description */
  description: string;
  
  /** Debit lines */
  debits: JournalLine[];
  
  /** Credit lines */
  credits: JournalLine[];
  
  /** Reference number */
  reference: string;
  
  /** Entry status */
  status: "draft" | "posted" | "reversed";
  
  /** Posted timestamp */
  postedAt?: number;
  
  /** Reversed timestamp */
  reversedAt?: number;
}

export interface Period {
  /** Period start date (ISO 8601) */
  startDate: string;
  
  /** Period end date (ISO 8601) */
  endDate: string;
  
  /** Period type */
  type: "monthly" | "quarterly" | "yearly";
}

export interface FinancialStatement {
  /** Statement type */
  type: "balance_sheet" | "income_statement" | "cash_flow" | "statement_of_changes_in_equity";
  
  /** Reporting period */
  period: Period;
  
  /** Statement data */
  data: Record<string, any>;
  
  /** Generated timestamp */
  generatedAt: number;
  
  /** Currency */
  currency: string;
}

export interface ValidationResult {
  /** Is valid? */
  valid: boolean;
  
  /** Validation errors */
  errors: ValidationError[];
  
  /** Validation warnings */
  warnings: ValidationWarning[];
}

export interface ValidationError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Error path (e.g., "debits[0].accountNumber") */
  path?: string;
  
  /** Requirement reference */
  requirement?: string;
}

export interface ValidationWarning {
  /** Warning code */
  code: string;
  
  /** Warning message */
  message: string;
  
  /** Recommendation */
  recommendation?: string;
}

export interface SOXAuditReport {
  /** Report period */
  period: Period;
  
  /** Internal controls validation */
  controls: ControlValidationResult[];
  
  /** Segregation of duties validation */
  segregationOfDuties: SODValidation[];
  
  /** Journal entry audit results */
  journalEntryAudits: AuditResult[];
  
  /** Overall compliance status */
  compliant: boolean;
  
  /** Generated timestamp */
  generatedAt: number;
}

export interface ControlValidationResult {
  /** Control ID */
  controlId: string;
  
  /** Control name */
  controlName: string;
  
  /** Is control effective? */
  effective: boolean;
  
  /** Control description */
  description: string;
  
  /** Test results */
  testResults: string[];
  
  /** Deficiencies (if any) */
  deficiencies: string[];
}

export interface SODValidation {
  /** User ID */
  userId: string;
  
  /** Violation type */
  violationType: "authorization" | "recording" | "custody" | "reconciliation";
  
  /** Violation description */
  description: string;
  
  /** Severity */
  severity: "critical" | "high" | "medium" | "low";
  
  /** Remediation required */
  remediationRequired: boolean;
}

export interface AuditResult {
  /** Entry ID */
  entryId: string;
  
  /** Audit status */
  status: "passed" | "failed" | "warning";
  
  /** Audit findings */
  findings: string[];
  
  /** Risk level */
  riskLevel: "low" | "medium" | "high";
}

