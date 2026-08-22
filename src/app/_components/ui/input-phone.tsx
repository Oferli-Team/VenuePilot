import { allowedCountry } from "@/lib/constants";
import React from "react";
import {
  PhoneInput,
  type PhoneInputProps,
  defaultCountries,
  parseCountry,
} from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

interface InputPhoneProps extends PhoneInputProps {
  defaultCountry?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  containerClass?: string;
  className?: string;
}

export const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  (
    {
      placeholder = "Número de celular",
      defaultCountry = "br",
      className,
      ...props
    },
    ref,
  ) => {
    const countries = defaultCountries.filter((country) => {
      const { iso2 } = parseCountry(country);
      return allowedCountry.countries.includes(iso2);
    });

    return (
      <div
        className={cn(
          "flex h-14 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1",
          className,
        )}
      >
        <PhoneInput
          inputRef={ref as React.MutableRefObject<HTMLInputElement>}
          defaultCountry={defaultCountry}
          countries={countries}
          placeholder={placeholder}
          className="w-full disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
      </div>
    );
  },
);

InputPhone.displayName = "InputPhone";
