/**
 * Avatar Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  fallback?: React.ReactNode;
  testId?: string;
  className?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  testId?: string;
  className?: string;
}

