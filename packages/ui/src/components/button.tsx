// packages/ui/src/components/button.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const base =
      variant === "secondary"
        ? componentTokens.buttonSecondary
        : variant === "ghost"
        ? componentTokens.buttonGhost
        : componentTokens.buttonPrimary;

    return (
      <button
        ref={ref}
        className={`${base} ${className ?? ""}`}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

