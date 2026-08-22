import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

type CardDashboardSkeletonProps = {
  className?: string;
};

export const CardDashboardSkeleton = ({
  className,
}: CardDashboardSkeletonProps) => {
  return (
    <Card
      className={cn("flex animate-pulse flex-col justify-between", className)}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 opacity-90">
        <Skeleton className="h-4 w-20 rounded-md"></Skeleton>
        <Skeleton className="h-4 w-4 rounded-full"></Skeleton>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <Skeleton className="h-6 w-16 rounded-md sm:w-24"></Skeleton>
        <Skeleton className="h-2 w-2 rounded-full"></Skeleton>
      </CardContent>
    </Card>
  );
};
