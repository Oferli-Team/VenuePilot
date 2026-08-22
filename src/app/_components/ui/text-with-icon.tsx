import { cn } from "@/lib/utils";
import React from "react";

type TextWithIconProps = {
  icon: React.ReactNode;
  label: string;
  labelClass?: string;
  description?: string;
  className?: string;
};

export const TextWithIcon = ({
  icon,
  label,
  labelClass,
  description,
  className,
}: TextWithIconProps) => {
  return (
    <div className={cn("flex flex-col justify-between gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-2 text-base font-medium sm:text-lg",
          labelClass,
        )}
      >
        <span className="text-primary">{icon}</span>
        <span className="">{label}</span>
      </div>
      {description && <p className="ml-7 font-normal">{description}</p>}
    </div>
  );
};
