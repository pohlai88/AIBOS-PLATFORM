import { contractEngine } from "../../contracts/contract-engine";
import { ContractError } from "../../hardening/errors/contract-error";
import { log } from "../../utils/logger";

export async function bootContracts(engines: any[]) {
  console.log("🧾 Validating engine contracts...");
  
  let failed = 0;
  
  for (const engine of engines) {
    try {
      const result = contractEngine.validateEngine(engine);
      
      if (!result.ok) {
        throw new ContractError(
          `Engine '${engine.name}' failed contract validation`,
          result.errors
        );
      }
      
      if (result.warnings.length > 0) {
        log.warn(`⚠️  Engine '${engine.name}' warnings:`, result.warnings);
      }
    } catch (err) {
      if (err instanceof ContractError) {
        log.error(`❌ ${err.message}`, err.cause);
      } else {
        log.error(`❌ Contract validation failed for '${engine.name}':`, err);
      }
      failed++;
    }
  }
  
  if (failed > 0) {
    throw new ContractError(`${failed} engine(s) failed validation. Aborting boot.`);
  }
  
  console.log("   All engine contracts validated.");
}

