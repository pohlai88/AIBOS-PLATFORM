/**
 * AuditLogTimeline Types - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

export type AuditAction = "create" | "update" | "delete" | "view" | "login" | "logout" | "error";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  description: string;
  user: { name: string; avatar?: string };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AuditLogTimelineProps {
  entries: AuditLogEntry[];
  onEntryClick?: (entry: AuditLogEntry) => void;
  showMetadata?: boolean;
  maxEntries?: number;
  testId?: string;
  className?: string;
}

