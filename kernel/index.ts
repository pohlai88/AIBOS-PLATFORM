import { bootstrapKernel } from "./bootstrap";
import { baseLogger } from "./observability/logger";

bootstrapKernel().then(() => {
  baseLogger.info("🔥 AI-BOS Kernel booted successfully");
}).catch((err) => {
  baseLogger.error({ err }, "❌ Kernel boot failed");
  process.exit(1);
});

