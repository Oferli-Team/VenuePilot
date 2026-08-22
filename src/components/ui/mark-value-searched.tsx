import { cn } from "@/lib/utils";
import { normalizeValue } from "@/lib/utils/normalizeValue";

type MarkValueSearchedProps = {
  value: string;
  searchValue?: string;
  className?: string;
};

export const MarkValueSearched = ({
  value,
  searchValue,
  className,
}: MarkValueSearchedProps) => {
  if (
    searchValue &&
    normalizeValue(value).toLowerCase().includes(searchValue)
  ) {
    const startIndex = normalizeValue(value).toLowerCase().indexOf(searchValue);
    const endIndex = startIndex + searchValue.length;

    return (
      <span className={cn(className)}>
        {value.substring(0, startIndex)}
        <mark className="bg-primary/80 text-foreground">
          {value.substring(startIndex, endIndex)}
        </mark>
        {value.substring(endIndex)}
      </span>
    );
  }

  return value;
};
