import { bootstrapKernel } from "./bootstrap";

bootstrapKernel().then(() => {
  console.log("🔥 AI-BOS Kernel booted successfully");
}).catch((err) => {
  console.error("❌ Kernel boot failed:", err);
  process.exit(1);
});

