import { loadEngines } from "../../registry/engine.loader";
import { engineRegistry } from "../../registry/engine.registry";
import { safeAwait } from "../../hardening/guards/safe-await";
import { withTimeout } from "../../hardening/guards/with-timeout";
import { engineLoaderLock } from "../../hardening/locks/engine-loader-lock";
import { kernelState } from "../../hardening/diagnostics/state";
import { baseLogger } from "../../observability/logger";

export async function bootEngines() {
  baseLogger.info("📦 Loading engines...");
  
  const [err] = await safeAwait(
    engineLoaderLock.lock(() =>
      withTimeout(loadEngines(), 3000, "Engine loading")
    )
  );
  
  if (err) {
    baseLogger.error({ err }, "❌ Engine loader error");
    throw err;
  }
  
  const engines: any[] = [];
  for (const [name, engine] of engineRegistry.engines.entries()) {
    engines.push({ name, ...engine });
  }
  
  kernelState.enginesLoaded = engines.length;
  baseLogger.info({ count: engines.length }, "   Loaded %d engine(s)", engines.length);
  return engines;
}

