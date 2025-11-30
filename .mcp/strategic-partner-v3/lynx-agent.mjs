/**
 * LYNX AGENT v2
 * Framework-Agnostic Component Generator
 * 
 * Implements:
 * - Skill #5: Framework-Agnostic Generation
 * - Skill #9: Interactive Showcase Generation
 */

import { BasePipeline, ValidationResult, MCPError, ErrorSeverity } from "./mcp-core.mjs";

// --- COMPONENT GENERATION PIPELINE ---

// interface ComponentGenRequest {
//   name: string;
//   type: "card" | "button" | "badge";
//   targetFramework: "react" | "vue" | "svelte" | "html";
// }

export class ComponentGenPipeline extends BasePipeline {
  validate(input) {
    const errors = [];
    const validTypes = ["card", "button", "badge", "panel", "input"];

    if (!input.name || input.name.length < 1) {
      errors.push("Component name is required.");
    }

    if (!input.type || !validTypes.includes(input.type)) {
      errors.push(`Type must be one of: ${validTypes.join(", ")}`);
    }

    const validFrameworks = ["react", "vue", "svelte", "html"];
    if (!input.targetFramework || !validFrameworks.includes(input.targetFramework)) {
      errors.push(`Framework must be one of: ${validFrameworks.join(", ")}`);
    }

    return new ValidationResult(errors.length === 0, errors);
  }

  async process(input) {
    const { name, type, targetFramework } = input;

    // 1. Define Abstract Template (The "Golden Source")
    const baseTemplates = {
      card: {
        structure: `div.glass-panel > h3.{title} + slot`,
        styles: `p-6 rounded-2xl backdrop-blur-xl border border-white/10`,
        props: ["title", "children"],
      },
      button: {
        structure: `button.jelly-btn > {label}`,
        styles: `px-6 py-3 font-bold transition-transform rounded-xl bg-primary text-primary-foreground`,
        props: ["label", "onClick", "disabled"],
      },
      badge: {
        structure: `span.badge > {text}`,
        styles: `px-2 py-1 rounded bg-success-soft text-success text-xs font-mono border border-success`,
        props: ["text", "variant"],
      },
      panel: {
        structure: `div.glass-panel > slot`,
        styles: `p-8 rounded-3xl backdrop-blur-2xl border border-white/10`,
        props: ["children"],
      },
      input: {
        structure: `input.text-input`,
        styles: `px-4 py-2 rounded-lg border border-border bg-bg text-fg`,
        props: ["value", "onChange", "placeholder"],
      },
    };

    const template = baseTemplates[type];
    if (!template) {
      throw new MCPError(
        "UNKNOWN_COMPONENT_TYPE",
        `Component type '${type}' not supported`,
        ErrorSeverity.WARNING,
        [`Use one of: ${Object.keys(baseTemplates).join(", ")}`]
      );
    }

    // 2. Framework Transpiler (Skill 5)
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);

    switch (targetFramework) {
      case "react": {
        const propsList = template.props.map((p) => `${p}${p === "children" ? "" : "?"}: ${p === "children" ? "React.ReactNode" : p === "onClick" ? "() => void" : p === "onChange" ? "(e: React.ChangeEvent<HTMLInputElement>) => void" : "string"}`).join(";\n  ");
        return {
          code: `import React from 'react';

export const ${componentName}: React.FC<{
  ${propsList};
}> = ({ ${template.props.join(", ")} }) => {
  return (
    <div className="${template.styles}">
      ${type === "button" ? "{label}" : type === "card" ? "<h3>{title}</h3>\n      {children}" : type === "badge" ? "{text}" : type === "input" ? `<input
        className="${template.styles}"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />` : "{children}"}
    </div>
  );
};

export default ${componentName};`,
          styles: `.${template.styles.split(" ")[0]} {
  /* Styles are applied via Tailwind classes */
}`,
          types: `export interface ${componentName}Props {
  ${template.props.map((p) => `${p}${p === "children" ? "" : "?"}: ${p === "children" ? "React.ReactNode" : p === "onClick" ? "() => void" : p === "onChange" ? "(e: React.ChangeEvent<HTMLInputElement>) => void" : "string"};`).join("\n  ")}
}`,
          framework: "react",
          componentType: type,
        };
      }

      case "vue": {
        return {
          code: `<template>
  <div class="${template.styles}">
    ${type === "button" ? "{{ label }}" : type === "card" ? "<h3>{{ title }}</h3>\n    <slot></slot>" : type === "badge" ? "{{ text }}" : type === "input" ? `<input
      class="${template.styles}"
      :value="value"
      @input="onChange"
      :placeholder="placeholder"
    />` : "<slot></slot>"}
  </div>
</template>

<script setup>
defineProps({
  ${template.props.map((p) => `${p}: { type: ${p === "children" ? "Object" : p === "onClick" || p === "onChange" ? "Function" : "String"}, ${p === "children" ? "" : "default: undefined"}}`).join(",\n  ")}
});
</script>`,
          styles: `.${template.styles.split(" ")[0]} {
  /* Styles are applied via Tailwind classes */
}`,
          framework: "vue",
          componentType: type,
        };
      }

      case "svelte": {
        return {
          code: `<script>
  export let ${template.props.join(";\n  export let ")};
</script>

<div class="${template.styles}">
  ${type === "button" ? "{label}" : type === "card" ? "<h3>{title}</h3>\n  <slot></slot>" : type === "badge" ? "{text}" : type === "input" ? `<input
    class="${template.styles}"
    bind:value
    on:input={onChange}
    placeholder={placeholder}
  />` : "<slot></slot>"}
</div>`,
          styles: `.${template.styles.split(" ")[0]} {
  /* Styles are applied via Tailwind classes */
}`,
          framework: "svelte",
          componentType: type,
        };
      }

      case "html": {
        return {
          code: `<!-- ${componentName} Component -->
<div class="${template.styles}">
  ${type === "button" ? "<button class=\"jelly-btn\">Click me</button>" : type === "card" ? "<h3>Card Title</h3>\n  <p>Card content</p>" : type === "badge" ? "<span class=\"badge\">Badge</span>" : type === "input" ? `<input
    class="${template.styles}"
    type="text"
    placeholder="Enter text"
  />` : "Component content"}
</div>`,
          styles: `.${template.styles.split(" ")[0]} {
  /* Styles are applied via Tailwind classes */
}`,
          framework: "html",
          componentType: type,
        };
      }

      default:
        throw new MCPError(
          "UNSUPPORTED_FRAMEWORK",
          `Framework '${targetFramework}' not supported`,
          ErrorSeverity.WARNING,
          [`Use one of: react, vue, svelte, html`]
        );
    }
  }
}

// --- SHOWCASE GENERATION PIPELINE (Skill #9) ---

// interface ShowcaseRequest {
//   components: string[]; // e.g. ["button", "card", "badge"]
//   title?: string;
// }

export class ShowcaseGenPipeline extends BasePipeline {
  validate(input) {
    const errors = [];

    if (!input.components || input.components.length === 0) {
      errors.push("Must specify at least one component to showcase.");
    }

    const validComponents = ["button", "card", "badge", "panel", "input"];
    const invalidComponents = input.components.filter((c) => !validComponents.includes(c));

    if (invalidComponents.length > 0) {
      errors.push(`Invalid components: ${invalidComponents.join(", ")}. Valid: ${validComponents.join(", ")}`);
    }

    return new ValidationResult(errors.length === 0, errors);
  }

  async process(input) {
    const { components, title = "Nano Banana // Living Showcase" } = input;

    // 1. THE ENGINE (Nano Banana CSS Variables)
    const cssEngine = `
      :root {
        --c-bg: #020617;
        --c-primary: #6366f1;
        --c-accent: #a855f7;
        --c-success: #10b981;
        --c-error: #ef4444;
        --c-warning: #f59e0b;
        --font-mono: 'JetBrains Mono', monospace;
        --font-sans: 'Inter', system-ui, sans-serif;
      }

      body { 
        background: var(--c-bg); 
        color: white; 
        font-family: var(--font-sans);
        margin: 0;
        padding: 0;
      }

      .glass-panel {
        background: rgba(255,255,255,0.03);
        backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 1rem;
      }

      .jelly-btn {
        background: var(--c-primary);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: bold;
        transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
        cursor: pointer;
        font-family: var(--font-sans);
      }

      .jelly-btn:active { transform: scale(0.95); }
      .jelly-btn:hover { 
        box-shadow: 0 0 20px rgba(99,102,241,0.4);
        transform: translateY(-1px);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .badge-success {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      .badge-warning {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .badge-error {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      @keyframes blob {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }

      .aurora-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        mix-blend-mode: screen;
        opacity: 0.4;
        animation: blob 7s infinite ease-in-out;
      }

      @media (prefers-reduced-motion: reduce) {
        .jelly-btn, .aurora-blob {
          animation: none !important;
          transition: none !important;
        }
      }
    `;

    // 2. THE COMPONENT LIBRARY (Simulated Registry)
    const library = {
      button: `<button class="jelly-btn" onclick="this.textContent = 'Activated!'">Initialize System</button>`,
      card: `
        <div class="glass-panel p-8 max-w-sm">
          <h3 class="text-xl font-bold mb-2" style="color: var(--c-primary);">Nano Card</h3>
          <p class="text-gray-400">This component uses optical physics for depth. The glass-panel effect creates a sense of elevation and transparency.</p>
          <div class="mt-4 flex gap-2">
            <span class="badge badge-success">Active</span>
            <span class="badge badge-warning">Beta</span>
          </div>
        </div>
      `,
      badge: `
        <div class="flex gap-3 items-center">
          <span class="badge badge-success">TIER 1</span>
          <span class="badge badge-warning">PENDING</span>
          <span class="badge badge-error">FAILED</span>
        </div>
      `,
      panel: `
        <div class="glass-panel p-8 max-w-md">
          <h2 class="text-2xl font-bold mb-4" style="color: var(--c-accent);">Glass Panel</h2>
          <p class="text-gray-300 mb-4">A versatile container with backdrop blur and subtle borders. Perfect for elevated content.</p>
          <button class="jelly-btn">Action Button</button>
        </div>
      `,
      input: `
        <div class="space-y-4 max-w-md">
          <input 
            type="text" 
            placeholder="Enter your name"
            class="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style="font-family: var(--font-sans);"
          />
          <input 
            type="email" 
            placeholder="your@email.com"
            class="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style="font-family: var(--font-sans);"
          />
        </div>
      `,
    };

    // 3. ASSEMBLE THE HTML
    const renderComponents = components
      .map((c) => {
        const html = library[c] || `<div class="p-4 border border-red-500/50 rounded">Component "${c}" not found in library</div>`;
        return `
        <div class="mb-12">
          <div class="text-xs font-mono text-gray-500 mb-4 uppercase tracking-widest">Component: &lt;${c} /&gt;</div>
          <div class="p-8 border border-white/5 rounded-xl border-dashed bg-white/2">
            ${html}
          </div>
        </div>
      `;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en" data-theme="default" data-mode="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <style>${cssEngine}</style>
</head>
<body class="min-h-screen p-12 relative overflow-x-hidden">
    <!-- Aurora Background -->
    <div class="fixed inset-0 z-0" aria-hidden="true">
      <div class="aurora-blob w-[600px] h-[600px] -top-[100px] -left-[100px] bg-primary"></div>
      <div class="aurora-blob w-[500px] h-[500px] -bottom-[50px] -right-[50px] bg-accent" style="animation-delay: 2s;"></div>
    </div>

    <header class="mb-16 flex items-center justify-between relative z-10">
        <div>
            <h1 class="text-4xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                ${title}
            </h1>
            <p class="text-gray-500 font-mono text-sm">Generated by Lynx Agent v3.0</p>
        </div>
        <div class="px-4 py-2 rounded-full glass-panel text-xs font-mono flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            SYSTEM ONLINE
        </div>
    </header>

    <main class="max-w-4xl mx-auto relative z-10">
        ${renderComponents}
    </main>

    <footer class="mt-16 pt-8 border-t border-white/5 text-center text-gray-500 text-sm font-mono relative z-10">
        <p>Nano Banana Design System // AI-BOS Platform</p>
    </footer>
</body>
</html>`;
  }
}

