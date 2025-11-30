/**
 * Data Contract Policy
 *
 * Evaluates data-contract-aware policies for actions.
 * Determines required scopes based on which data contracts an action touches.
 */

import type {
  DataContract,
  ActionDataContractLink,
  Classification,
  Sensitivity,
  AccessType,
} from "../metadata/catalog/types";
import { DataContractRepository } from "../metadata/catalog/data-contract.repository";
import { ActionDataContractRepository } from "../metadata/catalog/action-data-contract.repository";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface DataContractPolicyInput {
  tenantId: string | null;
  actionId: string;
  /** Scopes attached to the current principal (from auth) */
  scopes: string[];
}

export interface DataContractPolicyContractView {
  contract: DataContract;
  link: ActionDataContractLink;
}

export interface DataContractPolicyDecision {
  allowed: boolean;
  /** All scopes that were required based on contracts touched by this action */
  requiredScopes: string[];
  /** Which contracts were considered in this evaluation */
  contracts: DataContractPolicyContractView[];
  /** Human-readable reason / explanation for logs & diag */
  reason: string;
}

// ─────────────────────────────────────────────────────────────
// Scope Derivation Rules
// ─────────────────────────────────────────────────────────────

/**
 * Derive required scopes from contract classification, sensitivity, and access type.
 *
 * This is the core rule engine for data-contract-aware policies.
 * You can extend/configure this over time or move to metadata-driven rules.
 */
function getRequiredScopesForContract(
  contract: DataContract,
  link: ActionDataContractLink,
): string[] {
  const required = new Set<string>();

  const classification = contract.classification;
  const sensitivity = contract.sensitivity;
  const accessType = link.accessType;

  // ─── Classification-based rules ───

  // Financial data
  if (classification === "financial") {
    if (accessType === "write" || accessType === "read-write") {
      required.add("data:financial:write");
    }
    if (accessType === "read" || accessType === "read-write") {
      required.add("data:financial:read");
    }
  }

  // Regulatory data
  if (classification === "regulatory") {
    if (accessType === "write" || accessType === "read-write") {
      required.add("data:regulatory:write");
    }
    if (accessType === "read" || accessType === "read-write") {
      required.add("data:regulatory:read");
    }
  }

  // Operational data (less restrictive)
  if (classification === "operational") {
    if (accessType === "write" || accessType === "read-write") {
      required.add("data:operational:write");
    }
  }

  // ─── Sensitivity-based rules ───

  // Confidential or restricted data requires explicit access scope
  if (sensitivity === "confidential" || sensitivity === "restricted") {
    required.add("data:sensitive:access");
  }

  // Restricted data requires additional approval scope
  if (sensitivity === "restricted") {
    required.add("data:restricted:access");
  }

  return Array.from(required);
}

// ─────────────────────────────────────────────────────────────
// Core Evaluation Function
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate data-contract-aware policies for a given action.
 *
 * Algorithm:
 *  1. Look up all data-contract links for this action (read/write/read-write)
 *  2. Load the underlying DataContracts
 *  3. Derive required scopes from (classification, sensitivity, accessType)
 *  4. Check if caller's scopes cover these requirements
 */
export async function evaluateDataContractPolicies(
  input: DataContractPolicyInput,
): Promise<DataContractPolicyDecision> {
  const { tenantId, actionId, scopes } = input;

  const actionContractRepo = new ActionDataContractRepository();
  const contractRepo = new DataContractRepository();

  // Step 1: which contracts does this action touch?
  const links = await actionContractRepo.listContractsForAction(tenantId, actionId);

  if (links.length === 0) {
    // No data contracts bound => no additional scopes required
    return {
      allowed: true,
      requiredScopes: [],
      contracts: [],
      reason: "no_data_contracts_bound",
    };
  }

  // Step 2: load contract details and derive required scopes
  const contracts: DataContractPolicyContractView[] = [];
  const requiredScopes = new Set<string>();

  for (const link of links) {
    const contract = await contractRepo.findById(link.dataContractId);

    if (!contract) {
      // If a contract reference is invalid, fail closed for safety
      return {
        allowed: false,
        requiredScopes: [],
        contracts: [],
        reason: `missing_data_contract:${link.dataContractId}`,
      };
    }

    contracts.push({ contract, link });

    const scopesForContract = getRequiredScopesForContract(contract, link);
    for (const s of scopesForContract) {
      requiredScopes.add(s);
    }
  }

  // Step 3: check if caller scopes satisfy all required
  const requiredList = Array.from(requiredScopes);
  const missing = requiredList.filter((s) => !scopes.includes(s));

  if (missing.length > 0) {
    return {
      allowed: false,
      requiredScopes: requiredList,
      contracts,
      reason: `missing_scopes:${missing.join(",")}`,
    };
  }

  return {
    allowed: true,
    requiredScopes: requiredList,
    contracts,
    reason: "ok",
  };
}

// ─────────────────────────────────────────────────────────────
// Utility Exports
// ─────────────────────────────────────────────────────────────

export { getRequiredScopesForContract };

