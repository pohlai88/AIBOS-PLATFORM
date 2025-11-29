import { eventBus } from "../event-bus";
import { createContextLogger } from "../../observability/logger";

const logger = createContextLogger({ module: "kernel:events:audit" });

// Audit handler - logs all events
eventBus.subscribe("*", (event) => {
  logger.info({
    tenant: event.tenant,
    event: event.name,
    engine: event.engine,
    timestamp: new Date(event.timestamp).toISOString(),
    payload: event.payload
  }, "audit.event");
  
  // TODO[KERNEL-AUDIT]: Persist to audit log table
  // await db.from("audit_log").insert({ ... });
});

