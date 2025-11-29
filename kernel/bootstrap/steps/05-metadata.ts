import { metadataRegistry } from "../../registry/metadata.registry";
import { registryLock } from "../../hardening/locks/registry-lock";
import { kernelState } from "../../hardening/diagnostics/state";
import { baseLogger } from "../../observability/logger";

export async function bootMetadata(engines: any[]) {
  baseLogger.info("📘 Initializing metadata registry...");
  
  metadataRegistry.init();
  
  let modelCount = 0;
  
  await registryLock.lock(async () => {
    for (const engine of engines) {
      if (!engine.metadata) continue;
      
      for (const [model, schema] of Object.entries<any>(engine.metadata)) {
        try {
          metadataRegistry.registerModel(model, schema);
          modelCount++;
        } catch (err: any) {
          baseLogger.warn({ model, error: err.message }, "   ⚠️ %s: %s", model, err.message);
        }
      }
    }
  });
  
  kernelState.metadataCount = modelCount;
  baseLogger.info({ count: modelCount }, "   Registered %d model(s)", modelCount);
}

