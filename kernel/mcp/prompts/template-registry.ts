/**
 * MCP Prompt Template Registry
 * 
 * GRCD Compliance: F-13 (MCP Prompt Templates)
 * Standard: MCP Specification
 * 
 * Manages prompt templates with variable substitution.
 */

import {
  PromptTemplate,
  TemplateVariable,
  RenderedTemplate,
  ValidationResult,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("prompt-template-registry");

export class PromptTemplateRegistry {
  private templates: Map<string, PromptTemplate> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();

  constructor() {
    // Register built-in templates
    this.registerBuiltInTemplates();
  }

  /**
   * Register a template
   */
  registerTemplate(template: PromptTemplate): ValidationResult {
    // Validate template
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      return validation;
    }

    // Check for duplicate ID
    if (this.templates.has(template.id)) {
      logger.warn("Template already exists, overwriting", { templateId: template.id });
    }

    // Register template
    this.templates.set(template.id, template);

    // Update category index
    const category = template.metadata.category;
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(template.id);

    logger.info("Template registered", {
      templateId: template.id,
      name: template.name,
      category,
    });

    return { valid: true, errors: [], warnings: [] };
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): PromptTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * List templates (optionally filtered by category)
   */
  listTemplates(category?: string): PromptTemplate[] {
    if (category) {
      const templateIds = this.categoryIndex.get(category);
      if (!templateIds) {
        return [];
      }
      return Array.from(templateIds)
        .map((id) => this.templates.get(id))
        .filter((t): t is PromptTemplate => t !== undefined);
    }

    return Array.from(this.templates.values());
  }

  /**
   * Render template with variables
   */
  renderTemplate(id: string, variables: Record<string, any>): RenderedTemplate {
    const template = this.templates.get(id);

    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    // Validate variables
    const validation = this.validateVariables(id, variables);
    if (!validation.valid) {
      throw new Error(`Variable validation failed: ${validation.errors.join(", ")}`);
    }

    // Render template
    let content = template.template;

    // Replace variables: {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = String(value);
      content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement);
    }

    // Check for unresolved variables
    const unresolved = content.match(/\{\{(\w+)\}\}/g);
    if (unresolved) {
      logger.warn("Unresolved variables in template", {
        templateId: id,
        unresolved: unresolved.map((m) => m.replace(/[{}]/g, "")),
      });
    }

    logger.debug("Template rendered", {
      templateId: id,
      variablesCount: Object.keys(variables).length,
    });

    return {
      templateId: id,
      content,
      variables,
      renderedAt: Date.now(),
    };
  }

  /**
   * Validate variables against template
   */
  validateVariables(id: string, variables: Record<string, any>): ValidationResult {
    const template = this.templates.get(id);

    if (!template) {
      return {
        valid: false,
        errors: [`Template not found: ${id}`],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        if (variable.default === undefined) {
          errors.push(`Required variable missing: ${variable.name}`);
        } else {
          // Use default if provided
          variables[variable.name] = variable.default;
        }
      }
    }

    // Validate variable types
    for (const variable of template.variables) {
      if (variable.name in variables) {
        const value = variables[variable.name];
        const typeCheck = this.validateVariableType(variable, value);
        if (!typeCheck.valid) {
          errors.push(...typeCheck.errors);
        }
        if (typeCheck.warnings.length > 0) {
          warnings.push(...typeCheck.warnings);
        }
      }
    }

    // Check for extra variables (not in template)
    const templateVariableNames = new Set(template.variables.map((v) => v.name));
    for (const key of Object.keys(variables)) {
      if (!templateVariableNames.has(key)) {
        warnings.push(`Extra variable provided (not in template): ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate template structure
   */
  private validateTemplate(template: PromptTemplate): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ID required
    if (!template.id || template.id.trim().length === 0) {
      errors.push("Template ID is required");
    }

    // Name required
    if (!template.name || template.name.trim().length === 0) {
      errors.push("Template name is required");
    }

    // Template content required
    if (!template.template || template.template.trim().length === 0) {
      errors.push("Template content is required");
    }

    // Variables array required
    if (!Array.isArray(template.variables)) {
      errors.push("Template variables must be an array");
    }

    // Validate variables
    if (Array.isArray(template.variables)) {
      template.variables.forEach((variable, index) => {
        if (!variable.name || variable.name.trim().length === 0) {
          errors.push(`Variable[${index}]: name is required`);
        }
        if (!variable.type) {
          errors.push(`Variable[${index}]: type is required`);
        }
      });
    }

    // Metadata required
    if (!template.metadata) {
      errors.push("Template metadata is required");
    } else {
      if (!template.metadata.version) {
        errors.push("Template version is required");
      }
      if (!template.metadata.author) {
        errors.push("Template author is required");
      }
      if (!template.metadata.category) {
        errors.push("Template category is required");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate variable type
   */
  private validateVariableType(variable: TemplateVariable, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type checking
    switch (variable.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`Variable ${variable.name}: expected string, got ${typeof value}`);
        } else if (variable.pattern && !new RegExp(variable.pattern).test(value)) {
          errors.push(`Variable ${variable.name}: does not match pattern ${variable.pattern}`);
        }
        break;
      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push(`Variable ${variable.name}: expected number, got ${typeof value}`);
        } else {
          if (variable.min !== undefined && value < variable.min) {
            errors.push(`Variable ${variable.name}: value ${value} is less than minimum ${variable.min}`);
          }
          if (variable.max !== undefined && value > variable.max) {
            errors.push(`Variable ${variable.name}: value ${value} is greater than maximum ${variable.max}`);
          }
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Variable ${variable.name}: expected boolean, got ${typeof value}`);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          errors.push(`Variable ${variable.name}: expected array, got ${typeof value}`);
        }
        break;
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          errors.push(`Variable ${variable.name}: expected object, got ${typeof value}`);
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Register built-in templates
   */
  private registerBuiltInTemplates(): void {
    // Code Review Template
    this.registerTemplate({
      id: "builtin-code-review",
      name: "Code Review Prompt",
      description: "Template for AI code review tasks",
      template: `Please review the following code for {{language}}:

\`\`\`{{language}}
{{code}}
\`\`\`

Focus on:
- Code quality and best practices
- Potential bugs or security issues
- Performance optimizations
- Documentation and readability

Provide a detailed review with specific recommendations.`,
      variables: [
        {
          name: "language",
          type: "string",
          required: true,
          description: "Programming language",
        },
        {
          name: "code",
          type: "string",
          required: true,
          description: "Code to review",
        },
      ],
      metadata: {
        version: "1.0.0",
        author: "system",
        category: "code-review",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ["code", "review", "quality"],
      },
    });

    // Bug Analysis Template
    this.registerTemplate({
      id: "builtin-bug-analysis",
      name: "Bug Analysis Prompt",
      description: "Template for analyzing bugs and errors",
      template: `Analyze the following error/bug:

**Error Message:**
{{errorMessage}}

**Context:**
{{context}}

**Steps to Reproduce:**
{{stepsToReproduce}}

Please provide:
1. Root cause analysis
2. Impact assessment
3. Suggested fixes
4. Prevention strategies`,
      variables: [
        {
          name: "errorMessage",
          type: "string",
          required: true,
          description: "Error message or bug description",
        },
        {
          name: "context",
          type: "string",
          required: false,
          description: "Additional context",
        },
        {
          name: "stepsToReproduce",
          type: "string",
          required: false,
          description: "Steps to reproduce the issue",
        },
      ],
      metadata: {
        version: "1.0.0",
        author: "system",
        category: "bug-analysis",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ["bug", "error", "analysis"],
      },
    });

    // Architecture Design Template
    this.registerTemplate({
      id: "builtin-architecture-design",
      name: "Architecture Design Prompt",
      description: "Template for system architecture design",
      template: `Design a system architecture for:

**Requirements:**
{{requirements}}

**Constraints:**
{{constraints}}

**Scale:**
- Users: {{userCount}}
- Data Volume: {{dataVolume}}
- Performance: {{performanceRequirements}}

Please provide:
1. High-level architecture diagram (textual)
2. Component breakdown
3. Technology recommendations
4. Scalability considerations
5. Security considerations`,
      variables: [
        {
          name: "requirements",
          type: "string",
          required: true,
          description: "System requirements",
        },
        {
          name: "constraints",
          type: "string",
          required: false,
          description: "Technical or business constraints",
        },
        {
          name: "userCount",
          type: "number",
          required: false,
          default: 1000,
          description: "Expected user count",
        },
        {
          name: "dataVolume",
          type: "string",
          required: false,
          description: "Expected data volume",
        },
        {
          name: "performanceRequirements",
          type: "string",
          required: false,
          description: "Performance requirements",
        },
      ],
      metadata: {
        version: "1.0.0",
        author: "system",
        category: "architecture",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ["architecture", "design", "system"],
      },
    });

    // Compliance Check Template
    this.registerTemplate({
      id: "builtin-compliance-check",
      name: "Compliance Check Prompt",
      description: "Template for compliance validation",
      template: `Check compliance for the following:

**Standard:** {{standard}}
**Component:** {{component}}
**Context:** {{context}}

Please verify:
1. Compliance status
2. Violations (if any)
3. Recommendations
4. Remediation steps`,
      variables: [
        {
          name: "standard",
          type: "string",
          required: true,
          description: "Compliance standard (e.g., ISO 42001, GDPR)",
        },
        {
          name: "component",
          type: "string",
          required: true,
          description: "Component to check",
        },
        {
          name: "context",
          type: "string",
          required: false,
          description: "Additional context",
        },
      ],
      metadata: {
        version: "1.0.0",
        author: "system",
        category: "compliance",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ["compliance", "validation", "audit"],
      },
    });

    logger.info("Built-in templates registered", {
      count: this.templates.size,
    });
  }
}

// Singleton instance
export const promptTemplateRegistry = new PromptTemplateRegistry();

