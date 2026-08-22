import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

export const ChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="mt-2 h-3 w-3/4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded" />
        <Skeleton className="mt-4 flex justify-between">
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </Skeleton>
      </CardContent>
    </Card>
  );
};
