import { auditStore } from "./audit.store";
import { AuditEvent } from "./audit.types";
import { randomUUID } from "crypto";

export function logAudit(event: Omit<AuditEvent, "id" | "timestamp">) {
  const record: AuditEvent = {
    ...event,
    id: randomUUID(),
    timestamp: Date.now(),
  };
  auditStore.push(record);
}

