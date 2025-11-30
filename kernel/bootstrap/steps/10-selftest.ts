import { metadataRegistry } from "../../registry/metadata.registry";
import { engineRegistry } from "../../registry/engine.registry";
import { uiRegistry } from "../../ui/ui.registry";

export async function bootSelfTest() {
  console.log("🔍 Running kernel self-tests...");
  
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
        console.error(`   ❌ ${name} failed`);
        failed++;
      }
    } catch (err) {
      console.error(`   ❌ ${name} error:`, err);
      failed++;
    }
  }
  
  console.log(`   ${passed}/${tests.length} tests passed`);
  
  if (failed > 0) {
    console.error("   ⚠️ Some self-tests failed");
  }
}

