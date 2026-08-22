import { Skeleton } from "../ui/skeleton";

export const TicketSkeleton = () => {
  return (
    // <div className="relative flex w-full flex-col rounded-sm bg-background/60 px-4 py-8 sm:p-10">
    <div className="relative flex w-full flex-col gap-2 rounded-xl bg-gray-200 px-2 py-2 shadow-lg sm:px-8 sm:py-4">
      <div className="">
        <Skeleton className="mb-2 h-6 w-3/4 rounded bg-gray-300 sm:h-8" />
        <Skeleton className="h-4 w-full rounded bg-gray-300 sm:h-6" />
      </div>

      <div className="my-4 h-1 w-10/12 self-center rounded bg-gray-300"></div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
        <Skeleton className="col-span-full h-6 rounded bg-gray-300" />
        <Skeleton className="col-span-full h-6 rounded bg-gray-300" />
        <Skeleton className="col-span-full h-6 rounded bg-gray-300" />
      </div>
      <div className="my-4 h-1 w-10/12 self-center rounded bg-gray-300"></div>

      <div className="col-span-full mt-4 border-t-2 border-dashed border-gray-300 pt-4 text-center">
        <Skeleton className="mx-auto h-4 w-3/4 rounded bg-gray-300" />
      </div>
    </div>
    // </div>
  );
};
