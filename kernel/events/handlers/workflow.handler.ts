import { eventBus } from "../event-bus";
import { createContextLogger } from "../../observability/logger";

const logger = createContextLogger({ module: "kernel:events:workflow" });

// Workflow trigger handler
// TODO[KERNEL-WORKFLOW]: Connect to workflow engine when built

eventBus.subscribe("*.created", (event) => {
  logger.info({ event: event.name, tenant: event.tenant, engine: event.engine }, "workflow.trigger.created");
  
  // TODO[KERNEL-WORKFLOW]: Trigger workflow engine
  // await workflowEngine.trigger(event);
});

eventBus.subscribe("*.updated", (event) => {
  logger.info({ event: event.name, tenant: event.tenant, engine: event.engine }, "workflow.trigger.updated");
});

eventBus.subscribe("*.deleted", (event) => {
  logger.info({ event: event.name, tenant: event.tenant, engine: event.engine }, "workflow.trigger.deleted");
});

