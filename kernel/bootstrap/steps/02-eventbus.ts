import "../../events/index";

import { baseLogger } from "../../observability/logger";

export async function bootEventBus() {
  baseLogger.info("📡 Event Bus ready.");
}

