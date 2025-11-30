/**
 * Metadata Schema
 */

import { z } from "zod";

// The raw DB record shape
export const ZMetadataEntityRecord = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  namespace: z.string().min(1).max(128),
  key: z.string().min(1).max(256),
  value: z.unknown(),
  version: z.number().int().positive().default(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// A strongly-typed metadata entity where caller can plug type T for value
export const ZMetadataEntity = <T extends z.ZodTypeAny>(valueSchema: T) =>
  ZMetadataEntityRecord.extend({
    value: valueSchema,
  });

export const ZCreateMetadata = z.object({
  tenantId: z.string().uuid().nullable().optional(),
  namespace: z.string().min(1).max(128),
  key: z.string().min(1).max(256),
  value: z.unknown(),
});

export const ZUpdateMetadata = z.object({
  value: z.unknown(),
});

export type MetadataEntityRecord = z.infer<typeof ZMetadataEntityRecord>;
export type CreateMetadata = z.infer<typeof ZCreateMetadata>;
export type UpdateMetadata = z.infer<typeof ZUpdateMetadata>;
