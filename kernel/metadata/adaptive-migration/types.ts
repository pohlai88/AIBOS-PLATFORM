/**
 * Adaptive Migration Types
 * 
 * @module metadata/adaptive-migration/types
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type MigrationStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';

export interface SchemaDiff {
    breakingChanges: string[];
    safeChanges: string[];
    warnings: string[];
    hasBreakingChanges: boolean;
    riskLevel: RiskLevel;
}

export interface MigrationPhase {
    id: string;
    name: string;
    description: string;
    actions: string[];
    duration: 'instant' | 'background' | '7-day grace period' | 'scheduled';
    reversible: boolean;
}

export interface MigrationPlan {
    tableName: string;
    diff: SchemaDiff;
    phases: MigrationPhase[];
    totalPhases: number;
    estimatedDuration: string;
    rollbackWindow: number; // days
    requiresAIApproval: boolean;
    createdAt: Date;
}

export interface MigrationStatus {
    id: string;
    tableName: string;
    currentPhase: number;
    totalPhases: number;
    currentPhaseName?: string;
    status: MigrationStatusType;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
}

export interface MigrationResult {
    success: boolean;
    migrationId: string;
    tableName: string;
    completedPhases: number;
    error?: string;
}

export interface DualReadResult<T = unknown> {
    oldRows: T[];
    newRows: T[];
    driftDetected: boolean;
    differences?: string[];
}

