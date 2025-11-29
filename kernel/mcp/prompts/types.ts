/**
 * MCP Prompt Template Types
 * 
 * GRCD Compliance: F-13 (MCP Prompt Templates)
 * Standard: MCP Specification
 * 
 * Defines types for prompt template management.
 */

export interface TemplateVariable {
  /** Variable name */
  name: string;
  
  /** Variable type */
  type: "string" | "number" | "boolean" | "array" | "object";
  
  /** Is variable required? */
  required: boolean;
  
  /** Default value (optional) */
  default?: any;
  
  /** Variable description */
  description?: string;
  
  /** Validation pattern (for strings) */
  pattern?: string;
  
  /** Minimum value (for numbers) */
  min?: number;
  
  /** Maximum value (for numbers) */
  max?: number;
}

export interface PromptTemplate {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Template description */
  description?: string;
  
  /** Template content (with {{variable}} placeholders) */
  template: string;
  
  /** Template variables */
  variables: TemplateVariable[];
  
  /** Template metadata */
  metadata: {
    /** Template version */
    version: string;
    
    /** Template author */
    author: string;
    
    /** Template category */
    category: string;
    
    /** Created timestamp */
    createdAt: number;
    
    /** Updated timestamp */
    updatedAt: number;
    
    /** Tags for searchability */
    tags?: string[];
  };
}

export interface RenderedTemplate {
  /** Template ID */
  templateId: string;
  
  /** Rendered content */
  content: string;
  
  /** Variables used */
  variables: Record<string, any>;
  
  /** Rendered timestamp */
  renderedAt: number;
}

export interface ValidationResult {
  /** Is valid? */
  valid: boolean;
  
  /** Validation errors */
  errors: string[];
  
  /** Validation warnings */
  warnings: string[];
}

