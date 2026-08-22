import { Minus, Plus } from "lucide-react";
import { Button, ButtonProps } from "./button";

export const ButtonCounter = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = Infinity,
  disabled = false,
  variant,
}: {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  variant?: ButtonProps["variant"];
}) => (
  <div className="flex items-center justify-between gap-3">
    <Button
      variant={variant}
      size="icon"
      onClick={onDecrement}
      disabled={disabled || value <= min}
      className="rounded-full"
      type="button"
    >
      <Minus className="size-4" />
    </Button>
    <span className="w-4 text-center font-semibold">{value}</span>
    <Button
      variant={variant}
      size="icon"
      onClick={onIncrement}
      disabled={disabled || value >= max}
      className="rounded-full"
      type="button"
    >
      <Plus className="size-4" />
    </Button>
  </div>
);
