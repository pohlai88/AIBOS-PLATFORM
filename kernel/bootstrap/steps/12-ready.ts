import { eventBus } from "../../events/event-bus";
import { metadataRegistry } from "../../registry/metadata.registry";
import { uiRegistry } from "../../ui/ui.registry";
import { engineRegistry } from "../../registry/engine.registry";
import { kernelState } from "../../hardening/diagnostics/state";
import { baseLogger } from "../../observability/logger";

export async function bootReady() {
  baseLogger.info("🔒 Freezing registries...");
  metadataRegistry.freeze();
  uiRegistry.freeze();
  engineRegistry.freeze();
  baseLogger.info("   Registries frozen (immutable mode)");

  kernelState.setBootCompleted();

  eventBus.publish({
    name: "kernel.ready",
    payload: { bootedAt: new Date().toISOString() },
    engine: "kernel",
    tenant: "system",
    timestamp: Date.now()
  });

  baseLogger.info("🚀 Kernel Ready Event emitted.");
}

