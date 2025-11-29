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
import { bootTracker } from "../observability/performance/boot-tracker";
import { availabilityTracker } from "../observability/sla/availability-tracker";
import { memoryTracker } from "../observability/performance/memory-tracker";
import { baseLogger } from "../observability/logger";

export async function bootstrapKernel() {
  // NF-3: Start boot tracking
  bootTracker.startBoot();
  bootTracker.startStage("bootstrap-init");

  baseLogger.info("🔵 Booting AI-BOS Kernel...");
  baseLogger.info("═".repeat(50));

  // Phase 1: Core Infrastructure
  bootTracker.startStage("core-config");
  await bootConfig();
  bootTracker.endStage("core-config");

  bootTracker.startStage("core-logger");
  await bootLogger();
  bootTracker.endStage("core-logger");

  bootTracker.startStage("core-eventbus");
  await bootEventBus();
  bootTracker.endStage("core-eventbus");

  // Phase 2: Engine Loading & Validation
  bootTracker.startStage("engines-load");
  const engines = await bootEngines();
  bootTracker.endStage("engines-load");

  bootTracker.startStage("engines-contracts");
  await bootContracts(engines);
  bootTracker.endStage("engines-contracts");

  // Phase 3: Registry Initialization
  bootTracker.startStage("registry-metadata");
  await bootMetadata(engines);
  bootTracker.endStage("registry-metadata");

  bootTracker.startStage("registry-ui");
  await bootUI(engines);
  bootTracker.endStage("registry-ui");

  // Phase 4: Runtime Services
  bootTracker.startStage("runtime-tenants");
  await bootTenants();
  bootTracker.endStage("runtime-tenants");

  bootTracker.startStage("runtime-storage");
  await bootStorage();
  bootTracker.endStage("runtime-storage");

  bootTracker.startStage("runtime-ai");
  await bootAI();
  bootTracker.endStage("runtime-ai");

  // Phase 5: Verification & Startup
  bootTracker.startStage("verification-selftest");
  await bootSelfTest();
  bootTracker.endStage("verification-selftest");

  bootTracker.startStage("verification-api");
  await bootAPI();
  bootTracker.endStage("verification-api");

  bootTracker.startStage("verification-ready");
  await bootReady();
  bootTracker.endStage("verification-ready");

  // NF-3: End boot tracking
  bootTracker.endStage("bootstrap-init");
  const bootTime = bootTracker.endBoot();
  const bootReport = bootTracker.getBootReport();

  // NF-2: Mark system as available
  availabilityTracker.markUp("kernel-boot-complete", "Kernel bootstrap completed successfully");

  // NF-4: Initialize memory tracking
  memoryTracker.initialize();

  baseLogger.info("═".repeat(50));
  baseLogger.info("🟢 AI-BOS Kernel fully loaded.");
  baseLogger.info(
    {
      bootTime,
      compliant: bootReport.compliant,
      slaTarget: 5000,
    },
    `⏱️  Boot time: ${bootTime}ms (SLA: <5000ms, ${bootReport.compliant ? "✅ Compliant" : "❌ Non-compliant"})`
  );
  
  if (!bootReport.compliant) {
    const slowestStage = bootTracker.getSlowestStage();
    if (slowestStage) {
      baseLogger.warn(
        {
          stage: slowestStage.name,
          duration: slowestStage.duration,
        },
        `⚠️  Slowest stage: ${slowestStage.name} (${slowestStage.duration}ms)`
      );
    }
  }
}

