import { contractEngine } from "../../contracts/contract-engine";
import { ContractError } from "../../hardening/errors/contract-error";
import { createContextLogger } from "../../observability/logger";

const logger = createContextLogger({ module: "kernel:boot:contracts" });

export async function bootContracts(engines: any[]) {
  logger.info("Validating engine contracts...");
  
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
        logger.warn({ engine: engine.name, warnings: result.warnings }, "contract.warnings");
      }
    } catch (err) {
      if (err instanceof ContractError) {
        logger.error({ err, engine: engine.name }, "contract.validation.failed");
      } else {
        logger.error({ err, engine: engine.name }, "contract.validation.error");
      }
      failed++;
    }
  }
  
  if (failed > 0) {
    throw new ContractError(`${failed} engine(s) failed validation. Aborting boot.`);
  }
  
  logger.info({ count: engines.length }, "contract.validation.complete");
}

