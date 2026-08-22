"use client";
import { type FieldsetHTMLAttributes, type ReactNode } from "react";
import { type FieldError } from "react-hook-form";

type FieldsetProps = {
  isRequired?: boolean;
  legend?: string;
  validationMessage?: Pick<FieldError, "message"> | undefined;
  messageError?: string;
  children: ReactNode;
  className?: string;
} & FieldsetHTMLAttributes<HTMLFieldSetElement>;

export default function Fieldset({
  isRequired,
  legend,
  validationMessage,
  messageError,
  children,
  className,
  ...props
}: FieldsetProps) {
  return (
    <fieldset
      className={`mt-0 flex flex-col gap-1 p-0 text-sm sm:text-base ${className ?? ""}`}
      title={legend}
      {...props}
    >
      <p className="mb-1 text-sm leading-6 tracking-wide">
        {legend} {isRequired && <span className="text-primary">&#42;</span>}
      </p>

      {children}

      {validationMessage?.message && (
        <p className="h-4 text-sm text-destructive">
          {validationMessage?.message}
        </p>
      )}

      {messageError && (
        <p className="h-4 text-sm text-destructive">{messageError}</p>
      )}
    </fieldset>
  );
}
