/**
 * 🔄 Execution Pool v1.0
 * 
 * Parallel execution management:
 * - Worker pool for CPU-bound tasks
 * - Concurrency limits
 * - Priority queuing
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface Task<T = any> {
  id: string;
  fn: () => Promise<T>;
  priority: TaskPriority;
  tenantId?: string;
  timeout?: number;
  createdAt: number;
}

export interface TaskResult<T = any> {
  taskId: string;
  success: boolean;
  result?: T;
  error?: string;
  durationMs: number;
}

export interface PoolStats {
  queuedTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgDurationMs: number;
}

// ═══════════════════════════════════════════════════════════
// Execution Pool
// ═══════════════════════════════════════════════════════════

export class ExecutionPool {
  private static queue: Task[] = [];
  private static running = new Map<string, Task>();
  private static maxConcurrent = 10;
  private static completedCount = 0;
  private static failedCount = 0;
  private static totalDuration = 0;
  private static taskCounter = 0;

  private static priorityOrder: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  /**
   * Submit a task
   */
  static submit<T>(
    fn: () => Promise<T>,
    options?: {
      priority?: TaskPriority;
      tenantId?: string;
      timeout?: number;
    }
  ): Promise<TaskResult<T>> {
    const taskId = `task_${++this.taskCounter}_${Date.now()}`;

    const task: Task<T> = {
      id: taskId,
      fn,
      priority: options?.priority || "normal",
      tenantId: options?.tenantId,
      timeout: options?.timeout || 30000,
      createdAt: Date.now(),
    };

    return new Promise((resolve) => {
      // Attach resolver to task
      (task as any).resolve = resolve;

      // Add to queue in priority order
      this.queue.push(task);
      this.queue.sort((a, b) => 
        this.priorityOrder[a.priority] - this.priorityOrder[b.priority]
      );

      // Try to process
      this.processQueue();
    });
  }

  /**
   * Process queued tasks
   */
  private static async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;

      this.running.set(task.id, task);
      this.executeTask(task);
    }
  }

  /**
   * Execute a single task
   */
  private static async executeTask(task: Task): Promise<void> {
    const startTime = Date.now();
    const resolver = (task as any).resolve;

    try {
      // Setup timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Task timeout")), task.timeout);
      });

      const result = await Promise.race([task.fn(), timeoutPromise]);

      const duration = Date.now() - startTime;
      this.completedCount++;
      this.totalDuration += duration;

      resolver({
        taskId: task.id,
        success: true,
        result,
        durationMs: duration,
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.failedCount++;
      this.totalDuration += duration;

      resolver({
        taskId: task.id,
        success: false,
        error: error.message,
        durationMs: duration,
      });

    } finally {
      this.running.delete(task.id);
      this.processQueue();
    }
  }

  /**
   * Submit batch of tasks
   */
  static async submitBatch<T>(
    tasks: Array<{
      fn: () => Promise<T>;
      priority?: TaskPriority;
      tenantId?: string;
    }>
  ): Promise<TaskResult<T>[]> {
    return Promise.all(
      tasks.map(t => this.submit(t.fn, { priority: t.priority, tenantId: t.tenantId }))
    );
  }

  /**
   * Set concurrency limit
   */
  static setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max);
    this.processQueue();
  }

  /**
   * Get pool stats
   */
  static getStats(): PoolStats {
    const total = this.completedCount + this.failedCount;
    return {
      queuedTasks: this.queue.length,
      runningTasks: this.running.size,
      completedTasks: this.completedCount,
      failedTasks: this.failedCount,
      avgDurationMs: total > 0 ? this.totalDuration / total : 0,
    };
  }

  /**
   * Get queue length
   */
  static getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear queue (running tasks continue)
   */
  static clearQueue(): number {
    const cleared = this.queue.length;
    
    // Resolve all queued tasks as cancelled
    for (const task of this.queue) {
      const resolver = (task as any).resolve;
      resolver({
        taskId: task.id,
        success: false,
        error: "Task cancelled",
        durationMs: 0,
      });
    }
    
    this.queue = [];
    return cleared;
  }

  /**
   * Reset stats
   */
  static resetStats(): void {
    this.completedCount = 0;
    this.failedCount = 0;
    this.totalDuration = 0;
  }
}

export const executionPool = ExecutionPool;

