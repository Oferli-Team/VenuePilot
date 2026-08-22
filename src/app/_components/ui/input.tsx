import * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full relative items-center overflow-hidden rounded-md border text-base border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1",
  {
    variants: {
      inputSize: {
        lg: "h-14",
        sm: "h-10",
      },
    },
    defaultVariants: {
      inputSize: "lg",
    },
  },
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "lg" | "sm";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  noInputZoom?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputSize,
      type,
      leftIcon,
      rightIcon,
      noInputZoom = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn(inputVariants({ inputSize }), className)}>
        {leftIcon && (
          <span className="absolute left-3 flex items-center text-muted-foreground">
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          className={cn(
            "w-full flex-1 bg-transparent px-3 py-2 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            noInputZoom
              ? "focus:[-webkit-text-size-adjust:100%]"
              : "focus:[-webkit-text-size-adjust:auto]",
          )}
          ref={ref}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 flex items-center text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
