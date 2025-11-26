"use client";

import { useState, createContext, useContext, ReactNode } from "react";

interface ValidationError {
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
  nodeId: string;
  nodeType: string;
  parentId?: string;
}

interface ValidationSummary {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

interface DesignerMCPContextType {
  nodes: any[];
  setNodes: (nodes: any[]) => void;
  results: ValidationError[] | null;
  summary: ValidationSummary | null;
  theme: string;
  setTheme: (theme: string) => void;
  isLoading: boolean;
  validate: () => Promise<void>;
}

const DesignerMCPContext = createContext<DesignerMCPContextType | null>(null);

export function DesignerMCPProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [results, setResults] = useState<ValidationError[] | null>(null);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [theme, setTheme] = useState<string>("default");
  const [isLoading, setIsLoading] = useState(false);

  async function validate() {
    if (nodes.length === 0) return;

    setIsLoading(true);
    setResults(null);
    setSummary(null);

    try {
      const res = await fetch("/api/mcp/designer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, theme }),
      });

      if (!res.ok) {
        throw new Error(`Validation failed: ${res.statusText}`);
      }

      const json = await res.json();

      setResults(json.errors || []);
      setSummary({
        valid: json.valid,
        errorCount: json.errorCount,
        warningCount: json.warningCount,
        infoCount: json.infoCount,
      });
    } catch (err) {
      console.error("Validation error:", err);
      setResults([]);
      setSummary({
        valid: false,
        errorCount: 1,
        warningCount: 0,
        infoCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DesignerMCPContext.Provider
      value={{
        nodes,
        setNodes,
        results,
        summary,
        theme,
        setTheme,
        isLoading,
        validate,
      }}
    >
      {children}
    </DesignerMCPContext.Provider>
  );
}

export function useDesignerMCP(): DesignerMCPContextType {
  const context = useContext(DesignerMCPContext);

  if (!context) {
    // Return a standalone hook for simple usage without provider
    const [nodes, setNodes] = useState<any[]>([]);
    const [results, setResults] = useState<ValidationError[] | null>(null);
    const [summary, setSummary] = useState<ValidationSummary | null>(null);
    const [theme, setTheme] = useState<string>("default");
    const [isLoading, setIsLoading] = useState(false);

    async function validate() {
      if (nodes.length === 0) return;

      setIsLoading(true);
      setResults(null);
      setSummary(null);

      try {
        const res = await fetch("/api/mcp/designer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, theme }),
        });

        if (!res.ok) {
          throw new Error(`Validation failed: ${res.statusText}`);
        }

        const json = await res.json();

        setResults(json.errors || []);
        setSummary({
          valid: json.valid,
          errorCount: json.errorCount,
          warningCount: json.warningCount,
          infoCount: json.infoCount,
        });
      } catch (err) {
        console.error("Validation error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    return {
      nodes,
      setNodes,
      results,
      summary,
      theme,
      setTheme,
      isLoading,
      validate,
    };
  }

  return context;
}

