import React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";

type DataTableSkeletonProps = {
  columnCount: number;
  rowCount: number;
};

export const DataTableSkeleton = ({
  columnCount,
  rowCount,
}: DataTableSkeletonProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-6 py-4">
        <Skeleton className="h-10 w-full rounded-md sm:w-1/3" />
        <Skeleton className="h-10 w-full rounded-md sm:w-1/6" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-24 rounded-md"></Skeleton>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-6 w-full rounded-md"></Skeleton>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
