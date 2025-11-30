/**
 * AI-BOS Kernel Bootstrap Sequence
 * 
 * Master boot file - orchestrates all subsystems in correct order.
 * DO NOT change the sequence without careful consideration.
 */

import { bootConfig } from "./steps/00-config";
import { bootLogger } from "./steps/01-logger";
import { bootEventBus } from "./steps/02-eventbus";
import { bootEngines } from "./steps/03-engines";
import { bootContracts } from "./steps/04-contracts";
import { bootMetadata } from "./steps/05-metadata";
import { bootUI } from "./steps/06-ui";
import { bootTenants } from "./steps/07-tenants";
import { bootStorage } from "./steps/08-storage";
import { bootAI } from "./steps/09-ai";
import { bootSelfTest } from "./steps/10-selftest";
import { bootAPI } from "./steps/11-api";
import { bootReady } from "./steps/12-ready";

export async function bootstrapKernel() {
  console.log("🔵 Booting AI-BOS Kernel...");
  console.log("═".repeat(50));

  // Phase 1: Core Infrastructure
  await bootConfig();
  await bootLogger();
  await bootEventBus();

  // Phase 2: Engine Loading & Validation
  const engines = await bootEngines();
  await bootContracts(engines);

  // Phase 3: Registry Initialization
  await bootMetadata(engines);
  await bootUI(engines);

  // Phase 4: Runtime Services
  await bootTenants();
  await bootStorage();
  await bootAI();

  // Phase 5: Verification & Startup
  await bootSelfTest();
  await bootAPI();
  await bootReady();

  console.log("═".repeat(50));
  console.log("🟢 AI-BOS Kernel fully loaded.");
}

