/**
 * Availability Tracker
 * 
 * GRCD Compliance: NF-2 (Availability ≥99.9%)
 * Standard: SLA Management
 * 
 * Tracks system uptime and availability for SLA compliance.
 */

import { createTraceLogger } from "../logger";

const logger = createTraceLogger("availability-tracker");

export interface Period {
  start: number;
  end: number;
}

export interface SLAReport {
  /** Period covered */
  period: Period;
  
  /** Total uptime (milliseconds) */
  totalUptime: number;
  
  /** Total downtime (milliseconds) */
  totalDowntime: number;
  
  /** Availability percentage (0-100) */
  availability: number;
  
  /** SLA target (e.g., 99.9) */
  slaTarget: number;
  
  /** SLA compliance status */
  compliant: boolean;
  
  /** Downtime incidents */
  incidents: DowntimeIncident[];
  
  /** Generated timestamp */
  generatedAt: number;
}

export interface DowntimeIncident {
  /** Incident ID */
  id: string;
  
  /** Start timestamp */
  startTime: number;
  
  /** End timestamp (null if ongoing) */
  endTime: number | null;
  
  /** Duration (milliseconds) */
  duration: number;
  
  /** Reason */
  reason: string;
  
  /** Severity */
  severity: "low" | "medium" | "high" | "critical";
}

export class AvailabilityTracker {
  private uptimeRecords: Array<{ timestamp: number; status: "up" | "down" }> = [];
  private downtimeIncidents: Map<string, DowntimeIncident> = new Map();
  private currentStatus: "up" | "down" = "up";
  private currentIncidentId: string | null = null;
  private slaTarget: number = 99.9; // 99.9% default

  constructor(slaTarget: number = 99.9) {
    this.slaTarget = slaTarget;
    this.recordUptime(Date.now());
    logger.info("AvailabilityTracker initialized", { slaTarget });
  }

  /**
   * Record uptime
   */
  recordUptime(timestampMs: number = Date.now()): void {
    if (this.currentStatus === "down") {
      // End downtime incident
      if (this.currentIncidentId) {
        const incident = this.downtimeIncidents.get(this.currentIncidentId);
        if (incident) {
          incident.endTime = timestampMs;
          incident.duration = timestampMs - incident.startTime;
          this.downtimeIncidents.set(this.currentIncidentId, incident);
          
          logger.info("Downtime incident ended", {
            incidentId: this.currentIncidentId,
            duration: incident.duration,
          });
        }
        this.currentIncidentId = null;
      }
    }

    this.currentStatus = "up";
    this.uptimeRecords.push({ timestamp: timestampMs, status: "up" });
    
    // Keep only last 1000 records
    if (this.uptimeRecords.length > 1000) {
      this.uptimeRecords.shift();
    }
  }

  /**
   * Record downtime
   */
  recordDowntime(timestampMs: number = Date.now(), reason: string = "Unknown"): void {
    if (this.currentStatus === "up") {
      // Start new downtime incident
      const incidentId = `incident-${timestampMs}`;
      const incident: DowntimeIncident = {
        id: incidentId,
        startTime: timestampMs,
        endTime: null,
        duration: 0,
        reason,
        severity: this.determineSeverity(reason),
      };
      
      this.downtimeIncidents.set(incidentId, incident);
      this.currentIncidentId = incidentId;
      
      logger.warn("Downtime incident started", {
        incidentId,
        reason,
        severity: incident.severity,
      });
    }

    this.currentStatus = "down";
    this.uptimeRecords.push({ timestamp: timestampMs, status: "down" });
    
    // Keep only last 1000 records
    if (this.uptimeRecords.length > 1000) {
      this.uptimeRecords.shift();
    }
  }

  /**
   * Calculate availability for a period
   */
  calculateAvailability(period: Period): number {
    const { start, end } = period;
    const totalDuration = end - start;
    
    let uptime = 0;
    let downtime = 0;

    // Calculate from records
    for (let i = 0; i < this.uptimeRecords.length - 1; i++) {
      const record = this.uptimeRecords[i];
      const nextRecord = this.uptimeRecords[i + 1];
      
      if (record.timestamp >= start && record.timestamp < end) {
        const recordEnd = Math.min(nextRecord.timestamp, end);
        const recordStart = Math.max(record.timestamp, start);
        const duration = recordEnd - recordStart;
        
        if (record.status === "up") {
          uptime += duration;
        } else {
          downtime += duration;
        }
      }
    }

    // Handle current status
    const lastRecord = this.uptimeRecords[this.uptimeRecords.length - 1];
    if (lastRecord && lastRecord.timestamp < end) {
      const duration = end - lastRecord.timestamp;
      if (this.currentStatus === "up") {
        uptime += duration;
      } else {
        downtime += duration;
      }
    }

    // Calculate availability percentage
    const availability = totalDuration > 0 ? (uptime / totalDuration) * 100 : 100;
    
    return Math.round(availability * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get SLA report
   */
  getSLAReport(period: Period): SLAReport {
    const availability = this.calculateAvailability(period);
    const totalDuration = period.end - period.start;
    const totalUptime = (availability / 100) * totalDuration;
    const totalDowntime = totalDuration - totalUptime;

    // Get incidents in period
    const incidents = Array.from(this.downtimeIncidents.values()).filter(
      (incident) => incident.startTime >= period.start && incident.startTime < period.end
    );

    return {
      period,
      totalUptime,
      totalDowntime,
      availability,
      slaTarget: this.slaTarget,
      compliant: availability >= this.slaTarget,
      incidents,
      generatedAt: Date.now(),
    };
  }

  /**
   * Check SLA compliance
   */
  checkSLACompliance(period?: Period): boolean {
    if (!period) {
      // Default to last 30 days
      const now = Date.now();
      period = {
        start: now - 30 * 24 * 60 * 60 * 1000,
        end: now,
      };
    }

    const availability = this.calculateAvailability(period);
    return availability >= this.slaTarget;
  }

  /**
   * Get current status
   */
  getCurrentStatus(): "up" | "down" {
    return this.currentStatus;
  }

  /**
   * Get active incidents
   */
  getActiveIncidents(): DowntimeIncident[] {
    return Array.from(this.downtimeIncidents.values()).filter(
      (incident) => incident.endTime === null
    );
  }

  /**
   * Determine incident severity from reason
   */
  private determineSeverity(reason: string): "low" | "medium" | "high" | "critical" {
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes("critical") || reasonLower.includes("outage")) {
      return "critical";
    }
    if (reasonLower.includes("error") || reasonLower.includes("failure")) {
      return "high";
    }
    if (reasonLower.includes("warning") || reasonLower.includes("degraded")) {
      return "medium";
    }
    
    return "low";
  }
}

// Singleton instance
export const availabilityTracker = new AvailabilityTracker();

