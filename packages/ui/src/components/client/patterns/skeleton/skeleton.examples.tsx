/**
 * Skeleton Component Examples
 * Usage examples for the Skeleton Layer 3 pattern component
 */

import { Skeleton } from "./skeleton";
import { Card, CardHeader, CardBody } from "../card/card";

/**
 * Basic skeleton
 */
export function BasicSkeleton() {
  return <Skeleton width="200px" height="20px" />;
}

/**
 * Text skeleton
 */
export function TextSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}

/**
 * Circular skeleton (for avatars)
 */
export function CircularSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" size="sm" />
      </div>
    </div>
  );
}

/**
 * Rectangular skeleton (for images)
 */
export function RectangularSkeleton() {
  return <Skeleton variant="rectangular" width="100%" height={200} />;
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" size="sm" />
      </CardHeader>
      <CardBody>
        <Skeleton variant="rectangular" width="100%" height={150} />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Skeleton sizes
 */
export function SkeletonSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton variant="text" width="200px" size="sm" />
      <Skeleton variant="text" width="200px" size="md" />
      <Skeleton variant="text" width="200px" size="lg" />
    </div>
  );
}

/**
 * Non-animated skeleton
 */
export function NonAnimatedSkeleton() {
  return <Skeleton width="200px" height="20px" animate={false} />;
}

/**
 * Table skeleton
 */
export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
        </div>
      ))}
    </div>
  );
}

