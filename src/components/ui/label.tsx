import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-2",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";
