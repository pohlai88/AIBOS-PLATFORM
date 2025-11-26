"use client";

import { useEffect, useState } from "react";
import { themeTokens, clientTokens } from "@aibos/ui/design/tokens";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.setAttribute("data-mode", "dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    
    if (newMode) {
      document.documentElement.setAttribute("data-mode", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-mode");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        backgroundColor: themeTokens.bgMuted,
        border: `1px solid ${themeTokens.border}`,
        borderRadius: themeTokens.radiusMd,
        cursor: "pointer",
        transition: clientTokens.motion.transition,
        fontSize: "18px",
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

