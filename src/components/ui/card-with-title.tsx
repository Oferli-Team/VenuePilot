import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Separator } from "./separator";
import { cn } from "@/lib/utils";

export const CardWithTitle = ({
  title,
  subtitle,
  description,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="h-20 space-y-0 border-b border-muted px-2 pb-2">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="sm:text-base">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children}
    </Card>
  );
};
