/**
 * Alert Component Examples
 * Usage examples for the Alert Layer 3 pattern component
 */

import { Alert } from "./alert";

/**
 * Basic alert
 */
export function BasicAlert() {
  return <Alert description="This is a basic alert message" />;
}

/**
 * Alert with title
 */
export function AlertWithTitle() {
  return (
    <Alert
      title="Alert Title"
      description="This alert has both a title and description"
    />
  );
}

/**
 * Alert variants
 */
export function AlertVariants() {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="default" description="Default alert message" />
      <Alert variant="info" title="Info" description="Information alert" />
      <Alert variant="success" title="Success" description="Operation completed successfully" />
      <Alert variant="warning" title="Warning" description="Please review this warning" />
      <Alert variant="error" title="Error" description="An error has occurred" />
    </div>
  );
}

/**
 * Dismissible alert
 */
export function DismissibleAlert() {
  return (
    <Alert
      variant="info"
      title="Dismissible Alert"
      description="This alert can be dismissed"
      dismissible
      onDismiss={() => console.log("Alert dismissed")}
    />
  );
}

/**
 * Alert with custom icon
 */
export function AlertWithCustomIcon() {
  return (
    <Alert
      variant="success"
      title="Custom Icon"
      description="This alert uses a custom icon"
      icon={<span className="text-2xl">🎉</span>}
    />
  );
}

/**
 * Alert sizes
 */
export function AlertSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Alert size="sm" description="Small alert" />
      <Alert size="md" description="Medium alert (default)" />
      <Alert size="lg" description="Large alert" />
    </div>
  );
}

/**
 * Alert with children
 */
export function AlertWithChildren() {
  return (
    <Alert variant="info" title="Alert with Children">
      <p>You can use children instead of description for more complex content.</p>
      <button className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded">
        Action Button
      </button>
    </Alert>
  );
}

