"use client";

import * as React from "react";

// ============================================================================
// 🎨 AI-BOS Studio — World-Class Onboarding Wizard
// ============================================================================
// This demonstrates the unique AI-for-AI with HITL approach:
// - AI generates UI suggestions
// - Human approves/modifies
// - AI learns and improves
// - Governance validates everything
// ============================================================================

// Types
interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  aiCapability: string;
}

interface ComponentSuggestion {
  id: string;
  name: string;
  preview: React.ReactNode;
  aiConfidence: number;
  governanceStatus: "approved" | "pending" | "warning";
}

// ============================================================================
// STEP 1: Welcome & Role Selection
// ============================================================================
function WelcomeStep({
  onRoleSelect,
}: {
  onRoleSelect: (role: string) => void;
}) {
  const roles = [
    {
      id: "business",
      title: "Business Builder",
      subtitle: "No coding required",
      icon: "💼",
      description: "Build apps with drag-drop, AI assistance, and templates",
      tier: "Basic",
      color: "emerald",
    },
    {
      id: "department",
      title: "Department Lead",
      subtitle: "Power user features",
      icon: "📊",
      description: "Automate workflows, connect data sources, manage teams",
      tier: "Advanced",
      color: "blue",
    },
    {
      id: "enterprise",
      title: "Enterprise Architect",
      subtitle: "Full governance",
      icon: "🏛️",
      description: "Design systems, compliance, multi-tenant control",
      tier: "Premium",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          <span className="text-sm font-medium text-violet-300">
            AI-Powered Studio
          </span>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
          Welcome to AI-BOS Studio
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Build enterprise applications without code. Our AI understands your
          intent and generates governed, accessible, production-ready UI.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`
              group relative p-6 rounded-2xl border transition-all duration-300
              bg-zinc-900/50 border-zinc-800 hover:border-${role.color}-500/50
              hover:bg-zinc-900 hover:shadow-xl hover:shadow-${role.color}-500/10
              text-left
            `}
          >
            {/* Tier Badge */}
            <div
              className={`
              absolute top-4 right-4 px-2 py-1 rounded-md text-xs font-medium
              bg-${role.color}-500/10 text-${role.color}-400 border border-${role.color}-500/20
            `}
            >
              {role.tier}
            </div>

            {/* Icon */}
            <div className="text-4xl mb-4">{role.icon}</div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-white mb-1">
              {role.title}
            </h3>
            <p className={`text-sm text-${role.color}-400 mb-3`}>
              {role.subtitle}
            </p>
            <p className="text-sm text-zinc-400">{role.description}</p>

            {/* Hover Arrow */}
            <div
              className={`
              absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
              transition-opacity text-${role.color}-400
            `}
            >
              →
            </div>
          </button>
        ))}
      </div>

      {/* AI Assistant Hint */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10">
        <div className="text-2xl">🤖</div>
        <p className="text-sm text-zinc-400">
          <span className="text-violet-400 font-medium">AI Tip:</span> Not sure
          which to pick? I'll adapt to your skill level as we go!
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: AI Intent Capture
// ============================================================================
function IntentCaptureStep({
  onIntentSubmit,
}: {
  onIntentSubmit: (intent: string) => void;
}) {
  const [intent, setIntent] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const examplePrompts = [
    "Build a customer management dashboard",
    "Create an employee onboarding workflow",
    "Design an inventory tracking system",
    "Make a project approval process",
  ];

  const handleSubmit = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      onIntentSubmit(intent);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">
          What would you like to build?
        </h2>
        <p className="text-zinc-400">
          Describe your app in plain language. Our AI will understand and
          generate it.
        </p>
      </div>

      {/* Intent Input */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe what you want to build..."
            className="w-full h-32 bg-transparent text-white placeholder-zinc-500 resize-none focus:outline-none text-lg"
          />

          {/* AI Analysis Indicator */}
          {intent.length > 10 && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <div className="animate-pulse">🧠</div>
              <span className="text-sm text-violet-300">
                AI is analyzing: Detected{" "}
                <span className="font-semibold">
                  {intent.includes("dashboard")
                    ? "Dashboard"
                    : intent.includes("workflow")
                      ? "Workflow"
                      : "Application"}
                </span>{" "}
                pattern
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={intent.length < 10 || isAnalyzing}
            className={`
              mt-4 w-full py-3 rounded-xl font-medium transition-all
              ${
                intent.length >= 10
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                AI is generating your app...
              </span>
            ) : (
              "Generate with AI ✨"
            )}
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-3">
        <p className="text-sm text-zinc-500 text-center">
          Or try one of these examples:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setIntent(prompt)}
              className="px-4 py-2 rounded-full text-sm bg-zinc-800/50 text-zinc-300 border border-zinc-700 hover:border-violet-500/50 hover:text-violet-300 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: AI Generation Preview with HITL
// ============================================================================
function AIGenerationStep({
  intent,
  onApprove,
}: {
  intent: string;
  onApprove: () => void;
}) {
  const [generationPhase, setGenerationPhase] = React.useState(0);
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | null
  >(null);

  const phases = [
    { label: "Analyzing intent", icon: "🧠", duration: 800 },
    { label: "Generating layout", icon: "📐", duration: 600 },
    { label: "Creating components", icon: "🧩", duration: 700 },
    { label: "Applying governance", icon: "🛡️", duration: 500 },
    { label: "Validating accessibility", icon: "♿", duration: 400 },
  ];

  React.useEffect(() => {
    if (generationPhase < phases.length) {
      const timer = setTimeout(() => {
        setGenerationPhase((p) => p + 1);
      }, phases[generationPhase].duration);
      return () => clearTimeout(timer);
    }
  }, [generationPhase]);

  const isComplete = generationPhase >= phases.length;

  // Mock generated components
  const generatedComponents = [
    {
      id: "header",
      name: "Navigation Header",
      type: "layout",
      aiConfidence: 98,
      governance: "approved" as const,
    },
    {
      id: "sidebar",
      name: "Filter Sidebar",
      type: "composition",
      aiConfidence: 94,
      governance: "approved" as const,
    },
    {
      id: "table",
      name: "Data Table",
      type: "data",
      aiConfidence: 96,
      governance: "approved" as const,
    },
    {
      id: "modal",
      name: "Edit Modal",
      type: "functional",
      aiConfidence: 89,
      governance: "pending" as const,
    },
    {
      id: "chart",
      name: "Analytics Chart",
      type: "visualization",
      aiConfidence: 91,
      governance: "approved" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Generation Progress */}
      {!isComplete && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            AI is building your app...
          </h2>

          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div
                key={phase.label}
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                  ${
                    index < generationPhase
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : index === generationPhase
                        ? "bg-violet-500/10 border border-violet-500/20 animate-pulse"
                        : "bg-zinc-900/50 border border-zinc-800 opacity-50"
                  }
                `}
              >
                <span className="text-2xl">{phase.icon}</span>
                <span
                  className={`flex-1 ${index <= generationPhase ? "text-white" : "text-zinc-500"}`}
                >
                  {phase.label}
                </span>
                {index < generationPhase && (
                  <span className="text-emerald-400">✓</span>
                )}
                {index === generationPhase && (
                  <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Preview */}
      {isComplete && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your App is Ready! 🎉
              </h2>
              <p className="text-zinc-400">
                Review and customize the AI-generated components
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-emerald-400">
                Governance Passed
              </span>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="px-4 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-400 text-center">
                  your-app.aibos.io
                </div>
              </div>
            </div>

            {/* App Preview */}
            <div className="bg-zinc-950 p-4 min-h-[400px]">
              {/* Mock App Layout */}
              <div className="grid grid-cols-12 gap-4 h-full">
                {/* Sidebar */}
                <div className="col-span-3 space-y-4">
                  <div
                    className={`p-4 rounded-xl bg-zinc-900 border transition-all cursor-pointer ${selectedComponent === "sidebar" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-zinc-800 hover:border-zinc-700"}`}
                    onClick={() => setSelectedComponent("sidebar")}
                  >
                    <div className="space-y-3">
                      <div className="h-8 w-24 rounded bg-zinc-800"></div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-6 rounded bg-zinc-800"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-9 space-y-4">
                  {/* Header */}
                  <div
                    className={`p-4 rounded-xl bg-zinc-900 border transition-all cursor-pointer ${selectedComponent === "header" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-zinc-800 hover:border-zinc-700"}`}
                    onClick={() => setSelectedComponent("header")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-48 rounded bg-zinc-800"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-24 rounded bg-violet-500/20"></div>
                        <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div
                    className={`p-4 rounded-xl bg-zinc-900 border transition-all cursor-pointer ${selectedComponent === "table" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-zinc-800 hover:border-zinc-700"}`}
                    onClick={() => setSelectedComponent("table")}
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-4 rounded bg-zinc-700"
                          ></div>
                        ))}
                      </div>
                      {[1, 2, 3, 4].map((row) => (
                        <div key={row} className="grid grid-cols-5 gap-4">
                          {[1, 2, 3, 4, 5].map((col) => (
                            <div
                              key={col}
                              className="h-4 rounded bg-zinc-800"
                            ></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <div
                    className={`p-4 rounded-xl bg-zinc-900 border transition-all cursor-pointer ${selectedComponent === "chart" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-zinc-800 hover:border-zinc-700"}`}
                    onClick={() => setSelectedComponent("chart")}
                  >
                    <div className="flex items-end justify-around h-24 gap-2">
                      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-8 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-500"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component List with HITL Controls */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Generated Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {generatedComponents.map((comp) => (
                <div
                  key={comp.id}
                  className={`
                    p-4 rounded-xl border transition-all cursor-pointer
                    ${
                      selectedComponent === comp.id
                        ? "bg-violet-500/10 border-violet-500"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }
                  `}
                  onClick={() => setSelectedComponent(comp.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{comp.name}</h4>
                      <p className="text-sm text-zinc-500 capitalize">
                        {comp.type}
                      </p>
                    </div>
                    <div
                      className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${
                        comp.governance === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }
                    `}
                    >
                      {comp.governance === "approved" ? "✓ Approved" : "Review"}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: `${comp.aiConfidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {comp.aiConfidence}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HITL Actions */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <p className="text-sm text-white font-medium">
                  Human-in-the-Loop
                </p>
                <p className="text-xs text-zinc-400">
                  Review and approve AI suggestions before deployment
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                Regenerate
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
              >
                Approve & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 4: Theme Customization
// ============================================================================
function ThemeCustomizationStep({ onComplete }: { onComplete: () => void }) {
  const [selectedTheme, setSelectedTheme] = React.useState("violet");
  const [darkMode, setDarkMode] = React.useState(true);

  const themes = [
    {
      id: "violet",
      name: "Violet Dream",
      primary: "#8b5cf6",
      secondary: "#d946ef",
    },
    {
      id: "emerald",
      name: "Emerald Flow",
      primary: "#10b981",
      secondary: "#06b6d4",
    },
    { id: "amber", name: "Amber Glow", primary: "#f59e0b", secondary: "#ef4444" },
    { id: "slate", name: "Slate Pro", primary: "#64748b", secondary: "#94a3b8" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Customize Your Theme</h2>
        <p className="text-zinc-400">
          AI-BOS uses design tokens for consistent, accessible styling
        </p>
      </div>

      {/* Theme Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              ${
                selectedTheme === theme.id
                  ? "border-white bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }
            `}
          >
            <div className="flex gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: theme.primary }}
              ></div>
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: theme.secondary }}
              ></div>
            </div>
            <p className="text-sm font-medium text-white">{theme.name}</p>
            {selectedTheme === theme.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Dark/Light Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <span className={`text-sm ${!darkMode ? "text-white" : "text-zinc-500"}`}>
          ☀️ Light
        </span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`
            relative w-14 h-7 rounded-full transition-colors
            ${darkMode ? "bg-violet-500" : "bg-zinc-600"}
          `}
        >
          <div
            className={`
            absolute top-1 w-5 h-5 rounded-full bg-white transition-transform
            ${darkMode ? "left-8" : "left-1"}
          `}
          ></div>
        </button>
        <span className={`text-sm ${darkMode ? "text-white" : "text-zinc-500"}`}>
          🌙 Dark
        </span>
      </div>

      {/* Governance Badge */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="text-sm font-medium text-emerald-400">
            WCAG AA Compliant
          </p>
          <p className="text-xs text-zinc-400">
            All color combinations pass accessibility checks
          </p>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
      >
        Launch Your App 🚀
      </button>
    </div>
  );
}

// ============================================================================
// STEP 5: Success & Next Steps
// ============================================================================
function SuccessStep() {
  const nextSteps = [
    {
      icon: "📊",
      title: "Connect Data",
      description: "Link your Supabase, PostgreSQL, or API",
    },
    {
      icon: "⚡",
      title: "Add Workflows",
      description: "Automate with visual workflow builder",
    },
    {
      icon: "👥",
      title: "Invite Team",
      description: "Collaborate with role-based access",
    },
    {
      icon: "🚀",
      title: "Deploy",
      description: "Publish with 1-click to production",
    },
  ];

  return (
    <div className="space-y-8 text-center">
      {/* Success Animation */}
      <div className="relative inline-block">
        <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="relative text-8xl">🎉</div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">
          Your App is Live!
        </h2>
        <p className="text-zinc-400">
          AI-BOS Studio generated a fully governed, accessible application
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: "5", label: "Components" },
          { value: "100%", label: "Accessible" },
          { value: "<2s", label: "Build Time" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
          >
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">What's Next?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nextSteps.map((step) => (
            <button
              key={step.title}
              className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/50 transition-all text-left"
            >
              <div className="text-2xl mb-2">{step.icon}</div>
              <h4 className="font-medium text-white text-sm">{step.title}</h4>
              <p className="text-xs text-zinc-500">{step.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity">
        Open Studio Editor →
      </button>
    </div>
  );
}

// ============================================================================
// MAIN WIZARD COMPONENT
// ============================================================================
export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userIntent, setUserIntent] = React.useState<string>("");

  const steps = [
    { id: "welcome", title: "Welcome" },
    { id: "intent", title: "Describe" },
    { id: "generate", title: "Generate" },
    { id: "theme", title: "Customize" },
    { id: "success", title: "Launch" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all
                      ${
                        index < currentStep
                          ? "bg-emerald-500 text-white"
                          : index === currentStep
                            ? "bg-violet-500 text-white"
                            : "bg-zinc-800 text-zinc-500"
                      }
                    `}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs ${index <= currentStep ? "text-white" : "text-zinc-500"}`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${index < currentStep ? "bg-emerald-500" : "bg-zinc-800"}`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-zinc-900/30 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8">
          {currentStep === 0 && (
            <WelcomeStep
              onRoleSelect={(role) => {
                setUserRole(role);
                setCurrentStep(1);
              }}
            />
          )}
          {currentStep === 1 && (
            <IntentCaptureStep
              onIntentSubmit={(intent) => {
                setUserIntent(intent);
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <AIGenerationStep
              intent={userIntent}
              onApprove={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 3 && (
            <ThemeCustomizationStep onComplete={() => setCurrentStep(4)} />
          )}
          {currentStep === 4 && <SuccessStep />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          Powered by AI-BOS Studio • AI for AI with Human-in-the-Loop
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;

