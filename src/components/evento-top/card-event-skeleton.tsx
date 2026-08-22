import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const CardEventSkeleton = () => (
  <Card className="group flex w-80 flex-col gap-6 overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none" />

    <CardHeader className="p-4">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>

    <CardContent className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <Skeleton className="mt-4 h-10 w-full" />
    </CardContent>
  </Card>
);
