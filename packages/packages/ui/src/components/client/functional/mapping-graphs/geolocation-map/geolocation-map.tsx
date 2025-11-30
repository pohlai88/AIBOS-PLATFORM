/**
 * GeolocationMap Component - Layer 3 Functional Component
 * Placeholder for Mapbox/Leaflet integration
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { GeolocationMapProps, MapMarker } from "./geolocation-map.types";

const mapVariants = {
  base: ["relative w-full overflow-hidden", colorTokens.bgMuted, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  placeholder: ["absolute inset-0 flex flex-col items-center justify-center gap-2", colorTokens.fgMuted].join(" "),
  marker: ["absolute transform -translate-x-1/2 -translate-y-full cursor-pointer", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function GeolocationMap({
  markers = [],
  viewport,
  onViewportChange,
  onMarkerClick,
  height = 400,
  testId,
  className,
}: GeolocationMapProps) {
  // Placeholder - integrate with Mapbox or Leaflet
  const mapRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      role="application"
      aria-label={`Map centered at ${viewport.center.lat}, ${viewport.center.lng}`}
      className={cn(mapVariants.base, className)}
      style={{ height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
      ref={mapRef}
    >
      <div className={mapVariants.placeholder}>
        <MapPinIcon className="h-12 w-12" />
        <span className="text-sm">Map Component</span>
        <span className="text-xs">Integrate Mapbox or Leaflet</span>
        <span className="text-xs mt-2">Center: {viewport.center.lat.toFixed(4)}, {viewport.center.lng.toFixed(4)}</span>
        <span className="text-xs">Zoom: {viewport.zoom}</span>
      </div>
      {/* Markers would be rendered by the map library */}
      {markers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          onClick={() => onMarkerClick?.(marker)}
          className={mapVariants.marker}
          style={{ left: "50%", top: "50%" }}
          aria-label={marker.label || `Marker at ${marker.lat}, ${marker.lng}`}
        >
          {marker.icon || <MapPinIcon className="h-6 w-6 text-primary" />}
        </button>
      ))}
    </div>
  );
}

GeolocationMap.displayName = "GeolocationMap";
export { mapVariants };
export type { GeolocationMapProps, MapMarker, MapViewport } from "./geolocation-map.types";
export default GeolocationMap;

