/**
 * Progress Component Examples
 * Usage examples for the Progress Layer 3 pattern component
 */

import * as React from "react";
import { Progress } from "./progress";
import { Text } from "../../../shared/typography/text";

/**
 * Basic progress
 */
export function BasicProgress() {
  return <Progress value={50} />;
}

/**
 * Progress with value label
 */
export function ProgressWithLabel() {
  return <Progress value={75} showValue />;
}

/**
 * Progress variants
 */
export function ProgressVariants() {
  return (
    <div className="flex flex-col gap-4">
      <Progress variant="default" value={30} showValue />
      <Progress variant="primary" value={50} showValue />
      <Progress variant="success" value={70} showValue />
      <Progress variant="warning" value={85} showValue />
      <Progress variant="error" value={100} showValue />
    </div>
  );
}

/**
 * Progress sizes
 */
export function ProgressSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Progress size="sm" value={50} />
      <Progress size="md" value={50} />
      <Progress size="lg" value={50} />
    </div>
  );
}

/**
 * Progress with custom formatter
 */
export function ProgressWithCustomFormatter() {
  return (
    <Progress
      value={3}
      max={10}
      showValue
      formatValue={(value, max) => `${value} of ${max} items`}
    />
  );
}

/**
 * Animated progress (controlled)
 */
export function AnimatedProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return <Progress value={progress} showValue variant="primary" />;
}

/**
 * Multiple progress bars
 */
export function MultipleProgress() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Progress value={60} variant="success" showValue />
        <Text size="sm" color="muted" className="mt-1">
          Upload Progress
        </Text>
      </div>
      <div>
        <Progress value={30} variant="primary" showValue />
        <Text size="sm" color="muted" className="mt-1">
          Processing
        </Text>
      </div>
    </div>
  );
}

