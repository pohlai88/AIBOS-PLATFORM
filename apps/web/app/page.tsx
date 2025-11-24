// apps/web/app/page.tsx
"use client";

import { Button } from "@aibos/ui";
import { Card } from "@aibos/ui";
import { Badge } from "@aibos/ui";
import { useEffect, useState } from "react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = stored === "true" || (!stored && prefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-fg">AI-BOS UI Components</h1>
            <p className="text-fg-muted">
              Design system compliant components using tokens
            </p>
          </div>
          <Button variant="ghost" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </Button>
        </div>

        {/* Buttons Section */}
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-fg">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Card>

        {/* Cards Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-lg font-semibold text-fg">Card Title</h3>
            <p className="text-fg-muted">
              This is a card component using the card token preset.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 text-lg font-semibold text-fg">
              Another Card
            </h3>
            <p className="text-fg-muted">
              Cards automatically use bg-elevated, border, radius, and shadow
              tokens.
            </p>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-fg">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary Badge</Badge>
            <Badge variant="muted">Muted Badge</Badge>
            <Badge variant="primary">New</Badge>
            <Badge variant="muted">Status</Badge>
          </div>
        </Card>

        {/* Dark Mode Info */}
        <Card className="border-primary-soft bg-primary-soft/20">
          <p className="text-fg">
            <strong>Dark Mode:</strong> Use the toggle button in the top right
            to switch between light and dark modes. All tokens automatically
            adapt via CSS variables defined in{" "}
            <code className="rounded bg-bg-muted px-1.5 py-0.5 text-sm">
              globals.css
            </code>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
