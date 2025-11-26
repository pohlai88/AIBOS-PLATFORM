import { eventBus } from "../../events/event-bus";
import { metadataRegistry } from "../../registry/metadata.registry";
import { uiRegistry } from "../../ui/ui.registry";
import { engineRegistry } from "../../registry/engine.registry";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootReady() {
  console.log("🔒 Freezing registries...");
  metadataRegistry.freeze();
  uiRegistry.freeze();
  engineRegistry.freeze();
  console.log("   Registries frozen (immutable mode)");

  kernelState.setBootCompleted();

  eventBus.publish({
    name: "kernel.ready",
    payload: { bootedAt: new Date().toISOString() },
    engine: "kernel",
    tenant: "system",
    timestamp: Date.now()
  });
  
  console.log("🚀 Kernel Ready Event emitted.");
}

