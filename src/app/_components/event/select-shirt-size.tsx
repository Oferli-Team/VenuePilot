import type { SelectProps } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { shirtSizesREM } from "@/lib/constants";

export const SelectTShirtSize = ({
  sizes = shirtSizesREM,
  onBlur,
  onFocus,
  ...props
}: {
  sizes?: string[];
  onBlur?: () => void;
  onFocus?: () => void;
} & SelectProps) => {
  return (
    <Select {...props}>
      <SelectTrigger onFocus={onFocus}>
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={onBlur}>
        {sizes.map((size) => (
          <SelectItem key={size} value={size}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
