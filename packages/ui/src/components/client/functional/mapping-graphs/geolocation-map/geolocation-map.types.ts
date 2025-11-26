/**
 * GeolocationMap Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  icon?: React.ReactNode;
}

export interface MapViewport {
  center: { lat: number; lng: number };
  zoom: number;
}

export interface GeolocationMapProps {
  markers?: MapMarker[];
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string | number;
  testId?: string;
  className?: string;
}

