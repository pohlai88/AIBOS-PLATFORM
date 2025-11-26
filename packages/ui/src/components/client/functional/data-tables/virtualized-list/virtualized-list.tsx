/**
 * VirtualizedList Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import * as React from "react";

import { colorTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { VirtualizedListProps } from "./virtualized-list.types";

const virtualizedVariants = {
  base: ["overflow-auto relative", "mcp-functional-component"].join(" "),
};

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  testId,
  className,
}: VirtualizedListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label="Virtualized list"
      onScroll={handleScroll}
      className={cn(virtualizedVariants.base, className)}
      style={{ height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              role="listitem"
              style={{ height: itemHeight }}
              className={cn("flex items-center", colorTokens.fg)}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

VirtualizedList.displayName = "VirtualizedList";
export { virtualizedVariants };
export type { VirtualizedListProps } from "./virtualized-list.types";
export default VirtualizedList;

