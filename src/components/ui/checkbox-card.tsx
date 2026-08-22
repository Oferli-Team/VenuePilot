import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface RadioButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  checkedValue: string;
  setChecked: (value: string) => void;
}

const CheckboxCard = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ className, label, icon, checkedValue, setChecked, ...props }, ref) => {
    const checked = props.value === checkedValue;

    const handleCheckChange = (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      setChecked(e.target.value);
    };

    return (
      <fieldset
        className={`${cn(`relative flex flex-col items-center justify-center rounded-md border px-6 py-3 hover:border-gray-500/40 ${checked ? "bg-muted hover:bg-accent/80 " : "bg-muted/50 hover:bg-accent/40"}`, className)}`}
      >
        <label
          htmlFor={props.id}
          className="flex flex-col items-center justify-center gap-2 text-center text-base font-medium sm:flex-row"
        >
          {icon}
          {label}
        </label>
        <button
          type="button"
          className="absolute inset-0 cursor-pointer opacity-0"
          ref={ref}
          onClick={handleCheckChange}
          checked={checked}
          {...props}
        />

        <Check
          className={`absolute right-0 top-0 m-1 text-success transition-transform ${checked ? "scale-100" : "scale-0 opacity-0"}`}
          size={16}
        />
      </fieldset>
    );
  },
);
CheckboxCard.displayName = "CheckboxCard";

export { CheckboxCard };
