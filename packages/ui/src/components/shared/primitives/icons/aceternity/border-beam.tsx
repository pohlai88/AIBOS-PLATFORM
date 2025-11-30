/**
 * Border Beam - Aceternity UI Effect
 * 
 * Animated border that follows the container outline.
 * Perfect for icon cards and interactive elements.
 * 
 * Adapted from: https://www.aceternity.com/components/border-beam
 */

"use client";

import * as React from "react";
import { cn } from "@aibos/ui/design/utilities";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
    >
      {/* Border gradient animation */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-70"
        style={{
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo}, transparent)`,
          backgroundSize: "200% 100%",
          animation: `border-beam ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          maskImage: `linear-gradient(to right, transparent, white 20%, white 80%, transparent)`,
          WebkitMaskImage: `linear-gradient(to right, transparent, white 20%, white 80%, transparent)`,
        }}
      />
    </div>
  );
};

