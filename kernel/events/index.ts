// Event Bus exports
export { eventBus, publishEvent, subscribe, unsubscribe } from "./event-bus";
export type { KernelEvent, EventHandler } from "./event.types";

// Register all handlers
import "./handlers/audit.handler";
import "./handlers/workflow.handler";
import "./handlers/ai.handler";
