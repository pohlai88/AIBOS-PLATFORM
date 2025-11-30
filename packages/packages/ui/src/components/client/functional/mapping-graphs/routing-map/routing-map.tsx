/**
 * RoutingMap Component - Layer 3 Functional Component
 * Placeholder for routing map integration
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { RoutingMapProps, RouteWaypoint } from "./routing-map.types";

const routingMapVariants = {
  base: ["relative w-full", "mcp-functional-component"].join(" "),
  map: ["w-full overflow-hidden", colorTokens.bgMuted, radiusTokens.lg, "border", colorTokens.border].join(" "),
  waypointList: ["mt-4 space-y-2"].join(" "),
  waypoint: ["flex items-center gap-2 p-2", colorTokens.bgElevated, radiusTokens.md, "border", colorTokens.border].join(" "),
};

export function RoutingMap({
  waypoints,
  route,
  onWaypointAdd,
  onWaypointRemove,
  onWaypointReorder,
  height = 300,
  testId,
  className,
}: RoutingMapProps) {
  const totalDistance = route?.reduce((sum, seg) => sum + seg.distance, 0) || 0;
  const totalDuration = route?.reduce((sum, seg) => sum + seg.duration, 0) || 0;

  return (
    <div
      className={cn(routingMapVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div
        role="application"
        aria-label="Routing map"
        className={routingMapVariants.map}
        style={{ height }}
      >
        <div className={cn("h-full flex flex-col items-center justify-center gap-2", colorTokens.fgMuted)}>
          <MapPinIcon className="h-10 w-10" />
          <span className="text-sm">Routing Map</span>
          <span className="text-xs">Integrate Mapbox Directions API</span>
        </div>
      </div>

      <div className={routingMapVariants.waypointList} role="list" aria-label="Route waypoints">
        {waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
          <div key={wp.id} role="listitem" className={routingMapVariants.waypoint}>
            <span className={cn("w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold", "bg-primary text-primary-foreground")}>
              {idx + 1}
            </span>
            <span className="flex-1 text-sm">{wp.label || `${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}`}</span>
            {idx < waypoints.length - 1 && <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />}
            {onWaypointRemove && (
              <button
                type="button"
                onClick={() => onWaypointRemove(wp.id)}
                className="text-destructive text-sm hover:underline"
                aria-label={`Remove waypoint ${idx + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {route && route.length > 0 && (
        <div className={cn("mt-4 p-3", colorTokens.bgMuted, radiusTokens.md)} role="status">
          <div className="flex justify-between text-sm">
            <span>Total Distance: <strong>{(totalDistance / 1000).toFixed(1)} km</strong></span>
            <span>Est. Duration: <strong>{Math.round(totalDuration / 60)} min</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

RoutingMap.displayName = "RoutingMap";
export { routingMapVariants };
export type { RoutingMapProps, RouteWaypoint, RouteSegment } from "./routing-map.types";
export default RoutingMap;

