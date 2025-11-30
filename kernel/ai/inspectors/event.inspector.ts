import { lynx } from "../lynx.client";

export async function eventInspector(event: any) {
  return await lynx(`
You are the Kernel Event Analyzer.
Analyze this system event for:
- anomalies or suspicious patterns
- data quality issues
- workflow trigger opportunities
- compliance concerns
- performance implications

Event:
${JSON.stringify(event, null, 2)}

Provide insights and recommendations.
  `);
}

export async function eventPatternAnalyzer(events: any[]) {
  return await lynx(`
Analyze this sequence of events for patterns.

Events:
${JSON.stringify(events, null, 2)}

Identify:
1. Recurring patterns
2. Anomalies
3. Correlation between events
4. Potential automation opportunities
5. Performance bottlenecks
  `);
}

export async function anomalyDetector(event: any, historicalContext: string) {
  return await lynx(`
Detect anomalies in this event compared to historical patterns.

Current Event:
${JSON.stringify(event, null, 2)}

Historical Context:
${historicalContext}

Flag any:
- Unusual values
- Timing anomalies
- Pattern deviations
- Security concerns
  `);
}

