"use client";

import { useDesignerMCP } from "./useDesignerMCP";

export default function DesignerUpload() {
  const { nodes, setNodes, theme, setTheme, validate, isLoading } =
    useDesignerMCP();

  return (
    <div className="border border-[var(--border-color)] rounded-lg p-6 mb-6 bg-[var(--surface-bg-elevated)]">
      <h2 className="text-xl mb-4 font-medium text-[var(--text-fg)]">
        Upload Figma JSON
      </h2>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-fg-muted)] mb-2">
            Select exported JSON file
          </label>
          <input
            type="file"
            accept="application/json"
            className="block w-full text-sm text-[var(--text-fg)]
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-[var(--primary-bg)] file:text-[var(--primary-foreground)]
              hover:file:opacity-90
              cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                file.text().then((text) => {
                  try {
                    const parsed = JSON.parse(text);
                    // Handle both array and single object
                    setNodes(Array.isArray(parsed) ? parsed : [parsed]);
                  } catch {
                    alert("Invalid JSON file");
                  }
                });
              }
            }}
          />
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-fg-muted)] mb-2">
            Theme / Tenant
          </label>
          <select
            className="w-full border border-[var(--border-color)] rounded-md p-2 
              bg-[var(--surface-bg)] text-[var(--text-fg)]
              focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="dlbb">DLBB (Emerald)</option>
            <option value="client-template">Client Template</option>
          </select>
        </div>

        {/* Node Count */}
        {nodes.length > 0 && (
          <div className="text-sm text-[var(--text-fg-muted)]">
            📦 {nodes.length} node(s) loaded
          </div>
        )}

        {/* Validate Button */}
        <button
          onClick={validate}
          disabled={nodes.length === 0 || isLoading}
          className="w-full bg-[var(--primary-bg)] text-[var(--primary-foreground)] 
            px-4 py-3 rounded-md font-medium
            hover:opacity-90 transition-opacity
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Validating..." : "Validate Design"}
        </button>
      </div>
    </div>
  );
}

