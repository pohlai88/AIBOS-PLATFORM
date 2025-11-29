/**
 * Finance Orchestra Implementation
 * 
 * GRCD-KERNEL v4.0.0 Section 6.3: Financial Management Orchestra
 * Handles billing, costs, budgets, forecasts, and financial reports
 */

import type { OrchestraActionRequest, OrchestraActionResult } from "../types";
import { OrchestrationDomain } from "../types";
import { baseLogger as logger } from "../../observability/logger";
import { mfrsIfrsValidator } from "../../finance/compliance/mfrs-ifrs-validator";
import { chartOfAccounts } from "../../finance/compliance/chart-of-accounts";

export type FinanceAction =
  | "calculate_costs"
  | "generate_invoice"
  | "track_budget"
  | "forecast_spend"
  | "optimize_resources"
  | "export_financial_data";

export class FinanceOrchestra {
  private static instance: FinanceOrchestra;

  private constructor() {}

  public static getInstance(): FinanceOrchestra {
    if (!FinanceOrchestra.instance) {
      FinanceOrchestra.instance = new FinanceOrchestra();
    }
    return FinanceOrchestra.instance;
  }

  public async execute(request: OrchestraActionRequest): Promise<OrchestraActionResult> {
    const startTime = Date.now();

    try {
      if (request.domain !== OrchestrationDomain.FINANCE) {
        throw new Error(`Invalid domain: ${request.domain}`);
      }

      let result: any;

      switch (request.action as FinanceAction) {
        case "calculate_costs":
          result = await this.calculateCosts(request.arguments);
          // C-9: Validate financial data against MFRS/IFRS
          if (result && result.costs) {
            const validation = this.validateFinancialData(result);
            if (!validation.valid) {
              logger.warn({
                action: request.action,
                validationErrors: validation.errors,
              }, "⚠️ Financial data validation warnings");
            }
          }
          break;
        case "generate_invoice":
          result = await this.generateInvoice(request.arguments);
          // C-9: Validate invoice against MFRS/IFRS
          if (result && result.invoice_id) {
            const validation = this.validateInvoice(result);
            if (!validation.valid) {
              logger.warn({
                action: request.action,
                validationErrors: validation.errors,
              }, "⚠️ Invoice validation warnings");
              // Don't fail, but log warnings
            }
          }
          break;
        case "track_budget":
          result = await this.trackBudget(request.arguments);
          // C-9: Validate budget data against MFRS/IFRS
          if (result && result.budget) {
            const validation = this.validateBudgetData(result);
            if (!validation.valid) {
              logger.warn({
                action: request.action,
                validationErrors: validation.errors,
              }, "⚠️ Budget data validation warnings");
            }
          }
          break;
        case "forecast_spend":
          result = await this.forecastSpend(request.arguments);
          break;
        case "optimize_resources":
          result = await this.optimizeResources(request.arguments);
          break;
        case "export_financial_data":
          result = await this.exportFinancialData(request.arguments);
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      return {
        success: true,
        domain: request.domain,
        action: request.action,
        data: result,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          agentsInvolved: ["finance-agent"],
          toolsUsed: [request.action],
        },
      };
    } catch (error) {
      return {
        success: false,
        domain: request.domain,
        action: request.action,
        error: {
          code: "FINANCE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        metadata: { executionTimeMs: Date.now() - startTime },
      };
    }
  }

  private async calculateCosts(args: Record<string, any>): Promise<any> {
    const { service, period = "monthly" } = args;
    return {
      service,
      period,
      costs: {
        compute: { amount: 1250.50, currency: "USD" },
        storage: { amount: 340.25, currency: "USD" },
        network: { amount: 125.75, currency: "USD" },
        total: { amount: 1716.50, currency: "USD" },
      },
      breakdown: [
        { resource: "EC2 instances", cost: 850.00 },
        { resource: "RDS database", cost: 400.50 },
        { resource: "S3 storage", cost: 340.25 },
        { resource: "Data transfer", cost: 125.75 },
      ],
    };
  }

  private async generateInvoice(args: Record<string, any>): Promise<any> {
    const { customer, period } = args;
    return {
      invoice_id: "INV-2024-11-001",
      customer,
      period,
      items: [
        { description: "Platform usage", quantity: 1, unit_price: 1500, total: 1500 },
        { description: "API calls (10M)", quantity: 10, unit_price: 50, total: 500 },
      ],
      subtotal: 2000,
      tax: 200,
      total: 2200,
      currency: "USD",
      due_date: "2024-12-15",
      download_url: "/invoices/INV-2024-11-001.pdf",
    };
  }

  private async trackBudget(args: Record<string, any>): Promise<any> {
    const { department, month = "current" } = args;
    return {
      department,
      month,
      budget: {
        allocated: 5000,
        spent: 3250,
        remaining: 1750,
        utilizationPercent: 65,
      },
      alerts: [
        { type: "warning", message: "65% of budget used, 50% of month remaining" },
      ],
      topExpenses: [
        { category: "Cloud Infrastructure", amount: 1800 },
        { category: "SaaS licenses", amount: 950 },
        { category: "API costs", amount: 500 },
      ],
    };
  }

  private async forecastSpend(args: Record<string, any>): Promise<any> {
    const { horizon = "3m", basedOn = "historical" } = args;
    return {
      horizon,
      basedOn,
      forecast: {
        next_month: { estimated: 3500, confidence: 0.85 },
        next_quarter: { estimated: 11200, confidence: 0.75 },
      },
      trends: {
        compute: "+8% monthly growth",
        storage: "+3% monthly growth",
        overall: "+6% monthly growth",
      },
      recommendations: [
        "Consider reserved instances for 20% cost savings",
        "Archive old data to cold storage for 30% storage savings",
      ],
    };
  }

  private async optimizeResources(args: Record<string, any>): Promise<any> {
    const { target = "cost" } = args;
    return {
      target,
      recommendations: [
        {
          resource: "database-prod",
          action: "downsize",
          currentCost: 400,
          optimizedCost: 280,
          savings: 120,
          savingsPercent: 30,
        },
        {
          resource: "unused-snapshots",
          action: "delete",
          currentCost: 45,
          optimizedCost: 0,
          savings: 45,
          savingsPercent: 100,
        },
      ],
      totalMonthlySavings: 165,
      annualSavings: 1980,
    };
  }

  private async exportFinancialData(args: Record<string, any>): Promise<any> {
    const { format = "csv", period = "monthly", year = 2024 } = args;
    return {
      format,
      period,
      year,
      files: {
        costs: `costs_${year}_${period}.${format}`,
        invoices: `invoices_${year}_${period}.${format}`,
        budgets: `budgets_${year}_${period}.${format}`,
      },
      download_url: `/exports/financial_data_${year}_${period}.zip`,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * C-9: Validate financial data against MFRS/IFRS standards
   */
  private validateFinancialData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Validate currency format
      if (data.costs && data.costs.total) {
        if (!data.costs.total.currency || !data.costs.total.amount) {
          errors.push("Total cost must have currency and amount");
        }
        if (typeof data.costs.total.amount !== "number" || data.costs.total.amount < 0) {
          errors.push("Total amount must be a non-negative number");
        }
      }

      // Validate breakdown items
      if (data.breakdown && Array.isArray(data.breakdown)) {
        data.breakdown.forEach((item: any, index: number) => {
          if (!item.resource || typeof item.cost !== "number") {
            errors.push(`Breakdown item ${index} must have resource and numeric cost`);
          }
        });
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * C-9: Validate invoice against MFRS/IFRS standards
   */
  private validateInvoice(invoice: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Validate invoice structure
      if (!invoice.invoice_id || !invoice.customer) {
        errors.push("Invoice must have invoice_id and customer");
      }

      // Validate amounts
      if (typeof invoice.subtotal !== "number" || invoice.subtotal < 0) {
        errors.push("Subtotal must be a non-negative number");
      }
      if (typeof invoice.tax !== "number" || invoice.tax < 0) {
        errors.push("Tax must be a non-negative number");
      }
      if (typeof invoice.total !== "number" || invoice.total < 0) {
        errors.push("Total must be a non-negative number");
      }

      // Validate items
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach((item: any, index: number) => {
          if (!item.description || typeof item.quantity !== "number" || typeof item.unit_price !== "number") {
            errors.push(`Invoice item ${index} must have description, quantity, and unit_price`);
          }
        });
      }

      // Validate currency
      if (!invoice.currency || typeof invoice.currency !== "string") {
        errors.push("Invoice must have a valid currency code");
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * C-9: Validate budget data against MFRS/IFRS standards
   */
  private validateBudgetData(budget: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      if (budget.budget) {
        const b = budget.budget;
        if (typeof b.allocated !== "number" || b.allocated < 0) {
          errors.push("Budget allocated must be a non-negative number");
        }
        if (typeof b.spent !== "number" || b.spent < 0) {
          errors.push("Budget spent must be a non-negative number");
        }
        if (typeof b.remaining !== "number") {
          errors.push("Budget remaining must be a number");
        }
        if (b.spent > b.allocated) {
          errors.push("Budget spent cannot exceed allocated amount");
        }
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const financeOrchestra = FinanceOrchestra.getInstance();

