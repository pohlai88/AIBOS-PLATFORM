export type Severity = "error" | "warning" | "info";

export interface ValidationError {
  code: string;
  message: string;
  severity: Severity;
  nodeId: string;
  nodeType: string;
  parentId?: string;
}

