// Event Bus exports
export { eventBus, publishEvent, subscribe, unsubscribe } from "./bus";
export type { KernelEvent, EventHandler } from "./events.types";

// Register all handlers
import "./handlers/audit.handler";
import "./handlers/workflow.handler";
import "./handlers/ai.handler";
