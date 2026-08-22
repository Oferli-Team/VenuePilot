"use client";

import { Skeleton } from "../ui/skeleton";

export const EventDetailSkeleton = () => {
  return (
    <>
      <section className="mb-40 mt-24 flex justify-between gap-8 sm:mb-6">
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
            <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
          </div>
          <div className="mt-4 flex flex-col gap-2 md:hidden">
            <div className="flex items-center gap-1">
              <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
              <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
              <Skeleton className="mb-2 h-6 w-3/4 rounded bg-foreground/10 sm:h-8" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
          </div>

          <Skeleton className="mt-12 h-[10rem] w-full bg-foreground/10" />
        </div>

        <Skeleton className="sticky top-20 hidden hidden h-fit w-[32rem] bg-foreground/5 md:block">
          <div className="flex flex-col justify-between gap-6 rounded-md p-4">
            <div className="flex flex-col gap-4">
              <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
              <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
              <Skeleton className="mb-2 h-4 w-full rounded bg-foreground/10" />
            </div>

            <div className="flex flex-col gap-3">
              <Skeleton className="mb-2 h-8 w-full rounded bg-foreground/10" />
              <Skeleton className="mb-2 h-8 w-full rounded bg-foreground/10" />
            </div>
          </div>
        </Skeleton>
      </section>
    </>
  );
};
