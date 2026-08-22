import React, { type ReactElement } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Info } from "lucide-react";

type CardDashboardProps = {
  label: string;
  icon: ReactElement;
  value?: string | number;
  subValue?: React.ReactNode;
  isPending?: boolean;
  className?: string;
  infoContent?: React.ReactNode;
  onRedirect?: () => void;
};

export const CardDashboard = ({
  label,
  icon,
  value,
  subValue,
  isPending,
  infoContent,
  className,
  onRedirect,
}: CardDashboardProps) => {
  return (
    <Card
      className={cn(
        `flex flex-col justify-between ${!!onRedirect && "cursor-pointer"}`,
        className,
      )}
      onClick={onRedirect}
    >
      <CardHeader className="flex-row items-center justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>

        <div className="flex items-center gap-2">
          <span>{React.cloneElement(icon, { className: "w-4 h-4" })}</span>

          {!!infoContent && (
            <Popover>
              <PopoverTrigger className="space-y-0">
                <Info className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="flex flex-col items-center justify-center gap-2 py-6 text-center text-sm leading-5 text-muted-foreground"
              >
                {infoContent}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between sm:pt-1">
        <div>
          {value === undefined || value === null ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <h5 className="text-lg font-semibold sm:text-2xl">{value}</h5>
          )}

          {subValue && <div className="text-sm opacity-90">{subValue}</div>}
        </div>
        <p
          className={`h-2 w-2 rounded-full ${isPending ? "bg-destructive" : "bg-success"}`}
        ></p>
      </CardContent>
    </Card>
  );
};
