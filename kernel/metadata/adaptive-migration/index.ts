/**
 * Adaptive Migration — Zero-Downtime Schema Evolution
 * 
 * @module metadata/adaptive-migration
 */

export { AdaptiveMigrationEngine, adaptiveMigrationEngine } from './migration.engine';
export { DualReaderProxy, dualReaderProxy } from './dual-reader.proxy';
export type {
    RiskLevel,
    MigrationStatusType,
    SchemaDiff,
    MigrationPhase,
    MigrationPlan,
    MigrationStatus,
    MigrationResult,
    DualReadResult,
} from './types';

