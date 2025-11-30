/**
 * Badge Component Examples
 * Usage examples for the Badge Layer 3 pattern component
 */

import { Badge } from "./badge";

// Example icons (in real usage, import from icon library)
const CheckIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InfoIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * Basic badge usage
 */
export function BasicBadge() {
  return <Badge>Default Badge</Badge>;
}

/**
 * Badge variants
 */
export function VariantBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
    </div>
  );
}

/**
 * Badge sizes
 */
export function SizeBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  );
}

/**
 * Badge with leading icon
 */
export function BadgeWithLeadingIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" leadingIcon={<CheckIcon />}>
        Active
      </Badge>
      <Badge variant="warning" leadingIcon={<InfoIcon />}>
        Pending
      </Badge>
      <Badge variant="danger" leadingIcon={<XIcon />}>
        Error
      </Badge>
    </div>
  );
}

/**
 * Badge with trailing icon
 */
export function BadgeWithTrailingIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="primary" trailingIcon={<CheckIcon />}>
        Verified
      </Badge>
      <Badge variant="secondary" trailingIcon={<InfoIcon />}>
        Info
      </Badge>
    </div>
  );
}

/**
 * Dismissible badge
 */
export function DismissibleBadge() {
  return (
    <Badge variant="primary" dismissible onDismiss={() => console.log("Dismissed")}>
      This badge can be dismissed
    </Badge>
  );
}

/**
 * Clickable badge
 */
export function ClickableBadge() {
  return (
    <Badge
      variant="primary"
      clickable
      onClick={() => console.log("Badge clicked")}
    >
      Click me
    </Badge>
  );
}

/**
 * Complex badge with icon and dismiss
 */
export function ComplexBadge() {
  return (
    <Badge
      variant="success"
      leadingIcon={<CheckIcon />}
      dismissible
      onDismiss={() => console.log("Dismissed")}
    >
      Active Status
    </Badge>
  );
}

