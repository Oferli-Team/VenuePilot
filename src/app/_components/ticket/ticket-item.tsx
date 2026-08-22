import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type TicketItemProps = {
  title: string;
  description: ReactNode | string | number;
  descriptionColor?: string;
  className?: string;
};

export const TicketItem = ({
  title,
  description,
  descriptionColor = "text-foreground",
  className,
}: TicketItemProps) => {
  return (
    <div className={cn(`text-start`, className)}>
      <p className="text-xs font-semibold sm:text-sm">{title}</p>
      <span className={`text-sm md:text-base ${descriptionColor}`}>
        {description}
      </span>
    </div>
  );
};
