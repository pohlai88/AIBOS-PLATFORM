/**
 * Tenant Schema - Shared between Kernel and Web
 */

import { z } from "zod";

export const TenantStatusEnum = z.enum(["active", "suspended", "archived"]);

export const TenantPlanEnum = z.enum(["free", "pro", "team", "enterprise"]);

export const ZTenant = z.object({
    id: z.string().uuid(),
    code: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
    name: z.string().min(1).max(255),
    status: TenantStatusEnum.default("active"),
    plan: TenantPlanEnum.default("free"),
    settings: z.record(z.unknown()).default({}),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ZCreateTenant = ZTenant.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const ZUpdateTenant = ZCreateTenant.partial();

export type TenantStatus = z.infer<typeof TenantStatusEnum>;
export type TenantPlan = z.infer<typeof TenantPlanEnum>;
export type Tenant = z.infer<typeof ZTenant>;
export type CreateTenant = z.infer<typeof ZCreateTenant>;
export type UpdateTenant = z.infer<typeof ZUpdateTenant>;

