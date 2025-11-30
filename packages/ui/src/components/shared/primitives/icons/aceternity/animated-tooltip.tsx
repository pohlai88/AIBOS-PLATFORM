/**
 * Animated Tooltip - Aceternity UI Effect
 * 
 * A tooltip that reveals on hover and follows the mouse pointer.
 * Perfect for showing icon names, variants, and descriptions.
 * 
 * Adapted from: https://www.aceternity.com/components/animated-tooltip
 */

"use client";

import * as React from "react";
import { cn } from "@aibos/ui/design/utilities";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

export const AnimatedTooltip = ({
  children,
  tooltip,
  className,
  variant = "default",
}: AnimatedTooltipProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const variantStyles = {
    default: "bg-slate-800 text-white",
    primary: "bg-indigo-600 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isHovered && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none",
            "animate-in fade-in-0 zoom-in-95",
            variantStyles[variant],
            className
          )}
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y + 10}px`,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{
              backgroundColor: variant === "default" ? "#1e293b" : undefined,
              backgroundColor:
                variant === "primary"
                  ? "#4f46e5"
                  : variant === "success"
                    ? "#059669"
                    : variant === "warning"
                      ? "#d97706"
                      : variant === "error"
                        ? "#dc2626"
                        : "#1e293b",
            }}
          />
        </div>
      )}
    </div>
  );
};

