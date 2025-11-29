/**
 * Boot Time Tracker
 * 
 * GRCD Compliance: NF-3 (Boot Time <5s)
 * Standard: Performance SLA
 * 
 * Tracks kernel boot time and stage durations.
 */

import { createTraceLogger } from "../logger";

const logger = createTraceLogger("boot-tracker");

export interface BootStage {
  /** Stage name */
  name: string;
  
  /** Stage start timestamp */
  startTime: number;
  
  /** Stage end timestamp */
  endTime?: number;
  
  /** Stage duration (milliseconds) */
  duration?: number;
}

export interface BootReport {
  /** Total boot time (milliseconds) */
  totalBootTime: number;
  
  /** Boot stages */
  stages: BootStage[];
  
  /** SLA target (milliseconds) */
  slaTarget: number;
  
  /** SLA compliance status */
  compliant: boolean;
  
  /** Boot start timestamp */
  startTime: number;
  
  /** Boot end timestamp */
  endTime: number;
}

export class BootTracker {
  private bootStartTime: number | null = null;
  private bootEndTime: number | null = null;
  private stages: BootStage[] = [];
  private currentStage: BootStage | null = null;
  private slaTarget: number = 5000; // 5 seconds default

  constructor(slaTarget: number = 5000) {
    this.slaTarget = slaTarget;
    logger.info("BootTracker initialized", { slaTarget });
  }

  /**
   * Start boot timer
   */
  startBootTimer(): void {
    this.bootStartTime = Date.now();
    this.stages = [];
    logger.info("Boot timer started");
  }

  /**
   * Record boot stage
   */
  recordBootStage(stage: string, durationMs: number): void {
    const stageRecord: BootStage = {
      name: stage,
      startTime: this.bootStartTime || Date.now(),
      endTime: (this.bootStartTime || Date.now()) + durationMs,
      duration: durationMs,
    };

    this.stages.push(stageRecord);
    logger.debug("Boot stage recorded", { stage, durationMs });
  }

  /**
   * Start a boot stage
   */
  startStage(name: string): void {
    if (this.currentStage) {
      // End previous stage
      this.endStage();
    }

    this.currentStage = {
      name,
      startTime: Date.now(),
    };
  }

  /**
   * End current boot stage
   */
  endStage(): void {
    if (this.currentStage) {
      const endTime = Date.now();
      this.currentStage.endTime = endTime;
      this.currentStage.duration = endTime - this.currentStage.startTime;
      this.stages.push(this.currentStage);
      
      logger.debug("Boot stage ended", {
        stage: this.currentStage.name,
        duration: this.currentStage.duration,
      });
      
      this.currentStage = null;
    }
  }

  /**
   * End boot timer
   */
  endBootTimer(): number {
    if (this.currentStage) {
      this.endStage();
    }

    this.bootEndTime = Date.now();
    const totalBootTime = this.bootEndTime - (this.bootStartTime || this.bootEndTime);

    logger.info("Boot timer ended", {
      totalBootTime,
      stagesCount: this.stages.length,
      compliant: totalBootTime < this.slaTarget,
    });

    return totalBootTime;
  }

  /**
   * Get boot report
   */
  getBootReport(): BootReport {
    const totalBootTime = this.bootEndTime && this.bootStartTime
      ? this.bootEndTime - this.bootStartTime
      : 0;

    return {
      totalBootTime,
      stages: this.stages,
      slaTarget: this.slaTarget,
      compliant: totalBootTime < this.slaTarget,
      startTime: this.bootStartTime || 0,
      endTime: this.bootEndTime || Date.now(),
    };
  }

  /**
   * Verify boot SLA
   */
  verifyBootSLA(): boolean {
    const report = this.getBootReport();
    return report.compliant;
  }

  /**
   * Get slowest stage
   */
  getSlowestStage(): BootStage | null {
    if (this.stages.length === 0) {
      return null;
    }

    return this.stages.reduce((slowest, stage) => {
      const slowestDuration = slowest.duration || 0;
      const stageDuration = stage.duration || 0;
      return stageDuration > slowestDuration ? stage : slowest;
    });
  }
}

// Singleton instance
export const bootTracker = new BootTracker();

