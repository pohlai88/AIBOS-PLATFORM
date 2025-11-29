import { lynx, getLynxStatus } from "../../ai/lynx.client";
import { safeAwait } from "../../hardening/guards/safe-await";
import { withTimeout } from "../../hardening/guards/with-timeout";
import { kernelState } from "../../hardening/diagnostics/state";
import { baseLogger } from "../../observability/logger";

export async function bootAI() {
  baseLogger.info("🧠 Warming up Lynx AI...");

  const [statusErr, status] = await safeAwait(
    withTimeout(getLynxStatus(), 2000, "LLM status check")
  );

  if (statusErr || !status) {
    baseLogger.warn("   ⚠️ Could not check LLM status");
  } else {
    if (status.ollama) {
      baseLogger.info("   ✅ Ollama (local) available");
    } else {
      baseLogger.info("   ⚠️ Ollama (local) unavailable");
    }

    if (status.openai) {
      baseLogger.info("   ✅ OpenAI (fallback) available");
    } else {
      baseLogger.info("   ⚠️ OpenAI (fallback) unavailable");
    }
  }

  // Warm up with a simple prompt (4s max)
  const [warmupErr, warmup] = await safeAwait(
    withTimeout(lynx("Kernel boot sequence initiated. Respond with OK."), 4000, "Lynx warmup")
  );

  if (warmupErr) {
    baseLogger.warn({ err: warmupErr }, "   ⚠️ Lynx warmup failed (non-fatal)");
    return; // Don't throw - AI is optional
  }

  if (warmup && !warmup.includes("unavailable")) {
    baseLogger.info("   Lynx AI ready.");
    kernelState.aiReady = true;
  } else {
    baseLogger.info("   Lynx AI offline (governance checks will be skipped)");
  }
}

