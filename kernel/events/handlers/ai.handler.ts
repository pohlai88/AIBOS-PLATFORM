import { eventBus } from "../event-bus";
import { createContextLogger } from "../../observability/logger";
import { askLynx } from "../../ai/lynx.adapter";

const logger = createContextLogger({ module: "kernel:events:ai" });

// AI/Lynx handler for intelligent event analysis
// TODO[KERNEL-AI]: Enable when Lynx AI is fully integrated

eventBus.subscribe("*", async (event) => {
  // Only process significant events for AI analysis
  const significantEvents = ["invoice.created", "payment.failed", "anomaly.detected"];

  if (significantEvents.includes(event.name)) {
    logger.info({ event: event.name }, "ai.analysis.triggered");

    // TODO[KERNEL-AI]: Enable AI analysis
    // const analysis = await askLynx(`Analyze this event: ${JSON.stringify(event)}`);
    // logger.info({ analysis }, "ai.analysis.complete");
  }
});

