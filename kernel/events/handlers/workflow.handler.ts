import { eventBus } from "../bus";
import { log } from "../../utils/logger";

// Workflow trigger handler
// TODO: Connect to workflow engine when built

eventBus.subscribe("*.created", (event) => {
  log.info(`🔄 Workflow trigger: ${event.name}`, {
    tenant: event.tenant,
    engine: event.engine
  });
  
  // TODO: Trigger workflow engine
  // await workflowEngine.trigger(event);
});

eventBus.subscribe("*.updated", (event) => {
  log.info(`🔄 Workflow trigger: ${event.name}`, {
    tenant: event.tenant,
    engine: event.engine
  });
});

eventBus.subscribe("*.deleted", (event) => {
  log.info(`🔄 Workflow trigger: ${event.name}`, {
    tenant: event.tenant,
    engine: event.engine
  });
});

