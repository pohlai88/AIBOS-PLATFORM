import { metadataRegistry } from "../../registry/metadata.registry";
import { registryLock } from "../../hardening/locks/registry-lock";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootMetadata(engines: any[]) {
  console.log("📘 Initializing metadata registry...");
  
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
          console.warn(`   ⚠️ ${model}: ${err.message}`);
        }
      }
    }
  });
  
  kernelState.metadataCount = modelCount;
  console.log(`   Registered ${modelCount} model(s)`);
}

