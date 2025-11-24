// packages/ui/src/components/input.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // className is inherited from InputHTMLAttributes for layout overrides only
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={props.type || "text"}
        className={`${componentTokens.input} ${className ?? ""}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

