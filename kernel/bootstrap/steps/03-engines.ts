import { loadEngines } from "../../registry/engine.loader";
import { engineRegistry } from "../../registry/engine.registry";
import { safeAwait } from "../../hardening/guards/safe-await";
import { withTimeout } from "../../hardening/guards/with-timeout";
import { engineLoaderLock } from "../../hardening/locks/engine-loader-lock";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootEngines() {
  console.log("📦 Loading engines...");
  
  const [err] = await safeAwait(
    engineLoaderLock.lock(() =>
      withTimeout(loadEngines(), 3000, "Engine loading")
    )
  );
  
  if (err) {
    console.error("❌ Engine loader error:", err);
    throw err;
  }
  
  const engines: any[] = [];
  for (const [name, engine] of engineRegistry.engines.entries()) {
    engines.push({ name, ...engine });
  }
  
  kernelState.enginesLoaded = engines.length;
  console.log(`   Loaded ${engines.length} engine(s)`);
  return engines;
}

