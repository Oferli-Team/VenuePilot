import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const CardEventSelectSkeleton = () => {
  return (
    <Card className={`flex items-center justify-between gap-2 p-2`}>
      <div className="flex items-center gap-2">
        <CardHeader className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-muted sm:p-0">
          <Skeleton className="h-full w-full bg-muted" />
        </CardHeader>

        <CardContent className="sm:p-0">
          <Skeleton className="mb-2 h-4 w-24 bg-muted" />{" "}
          <Skeleton className="h-3 w-32 bg-muted" />{" "}
        </CardContent>
      </div>
    </Card>
  );
};
