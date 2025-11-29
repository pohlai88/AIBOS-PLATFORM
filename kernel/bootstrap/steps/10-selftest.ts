import { metadataRegistry } from "../../registry/metadata.registry";
import { engineRegistry } from "../../registry/engine.registry";
import { uiRegistry } from "../../ui/ui.registry";
import { baseLogger } from "../../observability/logger";

export async function bootSelfTest() {
  baseLogger.info("🔍 Running kernel self-tests...");

  const tests = [
    {
      name: "Engine Registry",
      test: () => typeof engineRegistry.list === "function"
    },
    {
      name: "Metadata Registry",
      test: () => typeof metadataRegistry.listModels === "function"
    },
    {
      name: "UI Registry",
      test: () => typeof uiRegistry.list === "function"
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        baseLogger.error({ testName: name }, "   ❌ %s failed", name);
        failed++;
      }
    } catch (err) {
      baseLogger.error({ testName: name, err }, "   ❌ %s error", name);
      failed++;
    }
  }

  baseLogger.info({ passed, total: tests.length }, "   %d/%d tests passed", passed, tests.length);

  if (failed > 0) {
    baseLogger.error({ failed }, "   ⚠️ Some self-tests failed");
  }
}

