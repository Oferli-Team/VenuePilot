import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import React from "react";

type IconTextProps = {
  icon: LucideIcon;
  iconClassName?: string;
  text: string;
  className?: string;
};

export const IconText = ({
  icon: Icon,
  iconClassName,
  text,
  className,
}: IconTextProps) => {
  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <Icon className={cn(iconClassName)} />
      <p>{text}</p>
    </div>
  );
};
