/**
 * Security Simulation Types
 * 
 * @module security/simulation/types
 */

export type SimulationStatus = 'PASS' | 'FAIL';

export type SimulationCategory = 
    | 'rbac'
    | 'injection'
    | 'xss'
    | 'tenantIsolation'
    | 'contractBypass'
    | 'metadataTampering';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AttackScenario {
    id: string;
    name: string;
    category: SimulationCategory;
    severity: SeverityLevel;
    description: string;
    execute: (tenantId: string) => Promise<{
        passed: boolean;
        message: string;
        details?: unknown;
    }>;
}

export interface SimulationResult {
    scenarioId: string;
    scenarioName: string;
    category: SimulationCategory;
    status: SimulationStatus;
    message: string;
    details?: unknown;
    durationMs: number;
    severity?: SeverityLevel;
}

export interface SimulationReport {
    timestamp: Date;
    totalScenarios: number;
    passed: number;
    failed: number;
    score: number; // 0-100
    results: SimulationResult[];
    heatmap: SecurityHeatmap;
    durationMs: number;
    deploymentAllowed: boolean;
}

export interface SecurityHeatmap {
    rbac: number; // 0-100
    injection: number; // 0-100
    xss: number; // 0-100
    tenantIsolation: number; // 0-100
    contractBypass: number; // 0-100
    metadataTampering: number; // 0-100
}

