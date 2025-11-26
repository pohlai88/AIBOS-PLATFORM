import { uiRegistry } from "../../ui/ui.registry";
import { registryLock } from "../../hardening/locks/registry-lock";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootUI(engines: any[]) {
  console.log("🎨 Initializing UI registry...");
  
  uiRegistry.init();
  
  let schemaCount = 0;
  
  await registryLock.lock(async () => {
    for (const engine of engines) {
      if (!engine.ui) continue;
      
      for (const [model, schema] of Object.entries(engine.ui)) {
        uiRegistry.register(model, schema);
        schemaCount++;
      }
    }
  });
  
  kernelState.uiSchemaCount = schemaCount;
  console.log(`   Registered ${schemaCount} UI schema(s)`);
}

