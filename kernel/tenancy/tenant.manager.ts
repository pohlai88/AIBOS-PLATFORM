import { Tenant } from "./tenant.types";
import { tenantLock } from "../hardening/locks/tenant-lock";
import { TenantError } from "../hardening/errors/tenant-error";

const tenants = new Map<string, Tenant>();

export const tenantManager = {
  createTenant(id: string, name: string) {
    if (tenants.has(id)) throw new TenantError("Tenant already exists");
    const tenant: Tenant = {
      id,
      name,
      engines: [],
      plan: "free",
      roles: {}
    };
    tenants.set(id, tenant);
    return tenant;
  },

  deleteTenant(id: string) {
    tenants.delete(id);
  },

  getTenant(id: string) {
    return tenants.get(id);
  },

  list() {
    return Array.from(tenants.values());
  },

  async enableEngine(tenantId: string, engine: string) {
    return tenantLock.lock(async () => {
      const t = tenants.get(tenantId);
      if (!t) throw new TenantError("Tenant not found");
      if (!t.engines.includes(engine)) {
        t.engines.push(engine);
      }
    });
  },

  async disableEngine(tenantId: string, engine: string) {
    return tenantLock.lock(async () => {
      const t = tenants.get(tenantId);
      if (!t) throw new TenantError("Tenant not found");
      t.engines = t.engines.filter(e => e !== engine);
    });
  }
};
