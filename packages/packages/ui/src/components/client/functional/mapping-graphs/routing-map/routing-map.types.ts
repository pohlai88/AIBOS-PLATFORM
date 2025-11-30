/**
 * RoutingMap Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface RouteWaypoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  order: number;
}

export interface RouteSegment {
  distance: number;
  duration: number;
  instructions?: string;
}

export interface RoutingMapProps {
  waypoints: RouteWaypoint[];
  route?: RouteSegment[];
  onWaypointAdd?: (lat: number, lng: number) => void;
  onWaypointRemove?: (id: string) => void;
  onWaypointReorder?: (waypoints: RouteWaypoint[]) => void;
  height?: string | number;
  testId?: string;
  className?: string;
}

