/**
 * Data Profiling Types
 * 
 * GRCD v4.1.0 Compliant: Data profiling for Tier 1/2 assets
 * Phase 3.1: Data Profiling Service
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Profiling Statistics
// ─────────────────────────────────────────────────────────────

export const ZProfilerStats = z.object({
  fieldId: z.string().uuid(),
  fieldUrn: z.string().min(1),
  tenantId: z.string().uuid().nullable(),
  tableName: z.string().min(1),
  columnName: z.string().min(1),
  
  // Basic Statistics
  rowCount: z.number().int().min(0),
  distinctCount: z.number().int().min(0),
  nullCount: z.number().int().min(0),
  nullPercentage: z.number().min(0).max(100),
  
  // Numeric Statistics (for numeric types)
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  avgValue: z.number().nullable(),
  medianValue: z.number().nullable(),
  stdDev: z.number().nullable(),
  
  // String Statistics (for string types)
  minLength: z.number().int().nullable(),
  maxLength: z.number().int().nullable(),
  avgLength: z.number().nullable(),
  
  // Date Statistics (for date/datetime types)
  minDate: z.date().nullable(),
  maxDate: z.date().nullable(),
  
  // Distribution (top values)
  topValues: z.array(z.object({
    value: z.union([z.string(), z.number(), z.boolean(), z.date()]),
    count: z.number().int().min(0),
    percentage: z.number().min(0).max(100),
  })).default([]),
  
  // Metadata
  dataType: z.string(),
  profiledAt: z.date(),
  profiledBy: z.string().nullable(),
  profilingDurationMs: z.number().int().min(0),
});

export type ProfilerStats = z.infer<typeof ZProfilerStats>;

// ─────────────────────────────────────────────────────────────
// Profiling Job
// ─────────────────────────────────────────────────────────────

export const ZProfilingJob = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  fieldId: z.string().uuid(),
  fieldUrn: z.string().min(1),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  scheduledAt: z.date(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  error: z.string().nullable(),
  stats: ZProfilerStats.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProfilingJob = z.infer<typeof ZProfilingJob>;

export const ZCreateProfilingJob = ZProfilingJob.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProfilingJob = z.infer<typeof ZCreateProfilingJob>;

// ─────────────────────────────────────────────────────────────
// Profiling Schedule
// ─────────────────────────────────────────────────────────────

export const ZProfilingSchedule = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  fieldId: z.string().uuid(),
  fieldUrn: z.string().min(1),
  governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']),
  frequency: z.enum(['daily', 'weekly', 'monthly']), // Tier 1: weekly, Tier 2: monthly
  cronExpression: z.string(), // Cron expression for scheduling
  isActive: z.boolean().default(true),
  lastRunAt: z.date().nullable(),
  nextRunAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProfilingSchedule = z.infer<typeof ZProfilingSchedule>;

export const ZCreateProfilingSchedule = ZProfilingSchedule.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProfilingSchedule = z.infer<typeof ZCreateProfilingSchedule>;

// ─────────────────────────────────────────────────────────────
// Profiling Options
// ─────────────────────────────────────────────────────────────

export interface ProfilingOptions {
  includeTopValues?: boolean;  // Include top N values (default: true)
  topValuesLimit?: number;     // Number of top values to include (default: 10)
  includeDistribution?: boolean;  // Include distribution histogram (default: false)
  sampleSize?: number;         // Sample size for large tables (default: null = full table)
  timeoutMs?: number;          // Timeout for profiling query (default: 300000 = 5 minutes)
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { ProfilerStats, ProfilingJob, CreateProfilingJob, ProfilingSchedule, CreateProfilingSchedule };

