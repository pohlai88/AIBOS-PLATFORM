import { lynx, getLynxStatus } from "../../ai/lynx.client";
import { safeAwait } from "../../hardening/guards/safe-await";
import { withTimeout } from "../../hardening/guards/with-timeout";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootAI() {
  console.log("🧠 Warming up Lynx AI...");
  
  const [statusErr, status] = await safeAwait(
    withTimeout(getLynxStatus(), 2000, "LLM status check")
  );
  
  if (statusErr || !status) {
    console.warn("   ⚠️ Could not check LLM status");
  } else {
    if (status.ollama) {
      console.log("   ✅ Ollama (local) available");
    } else {
      console.log("   ⚠️ Ollama (local) unavailable");
    }
    
    if (status.openai) {
      console.log("   ✅ OpenAI (fallback) available");
    } else {
      console.log("   ⚠️ OpenAI (fallback) unavailable");
    }
  }
  
  // Warm up with a simple prompt (4s max)
  const [warmupErr, warmup] = await safeAwait(
    withTimeout(lynx("Kernel boot sequence initiated. Respond with OK."), 4000, "Lynx warmup")
  );
  
  if (warmupErr) {
    console.warn("   ⚠️ Lynx warmup failed (non-fatal):", warmupErr);
    return; // Don't throw - AI is optional
  }
  
  if (warmup && !warmup.includes("unavailable")) {
    console.log("   Lynx AI ready.");
    kernelState.aiReady = true;
  } else {
    console.log("   Lynx AI offline (governance checks will be skipped)");
  }
}

