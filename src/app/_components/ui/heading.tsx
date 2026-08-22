import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type HeadingProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  lineLeft?: boolean;
  lineBottom?: boolean;
  className?: string;
  justSubtitle?: boolean;
};

export const Heading = ({
  icon: Icon,
  title,
  subtitle,
  lineLeft,
  lineBottom,
  className,
}: HeadingProps) => {
  return (
    <div
      className={cn(
        `flex flex-col justify-start gap-2 text-lg sm:text-xl ${lineLeft && "border-l-4 border-primary pl-2"} ${lineBottom && "border-b-2 border-muted"}`,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-6 w-6" />}
        <h2 className="m-0 p-0  font-semibold">{title}</h2>
      </div>
      {subtitle && (
        <h3 className="text-sm font-medium sm:text-base">{subtitle}</h3>
      )}
    </div>
  );
};
