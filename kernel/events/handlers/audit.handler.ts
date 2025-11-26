import { eventBus } from "../bus";
import { log } from "../../utils/logger";

// Audit handler - logs all events
eventBus.subscribe("*", (event) => {
  log.info(`📋 AUDIT: [${event.tenant}] ${event.name}`, {
    engine: event.engine,
    timestamp: new Date(event.timestamp).toISOString(),
    payload: event.payload
  });
  
  // TODO: Persist to audit log table
  // await db.from("audit_log").insert({ ... });
});

