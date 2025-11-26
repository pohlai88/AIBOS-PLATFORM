import { eventBus } from "../event-bus";
import { log } from "../../utils/logger";
import { askLynx } from "../../ai/lynx.adapter";

// AI/Lynx handler for intelligent event analysis
// TODO: Enable when Lynx AI is fully integrated

eventBus.subscribe("*", async (event) => {
  // Only process significant events for AI analysis
  const significantEvents = ["invoice.created", "payment.failed", "anomaly.detected"];
  
  if (significantEvents.includes(event.name)) {
    log.info(`🤖 AI Analysis: ${event.name}`);
    
    // TODO: Enable AI analysis
    // const analysis = await askLynx(`Analyze this event: ${JSON.stringify(event)}`);
    // log.info(`🤖 Lynx says: ${analysis}`);
  }
});

