import { baseLogger } from "../../observability/logger";

export async function bootLogger() {
  baseLogger.info("Logger initialized (pino structured logging)");
}

