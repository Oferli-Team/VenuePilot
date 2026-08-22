import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { type Table } from "@tanstack/react-table";

type PaginationProps<TData> = {
  totalPages?: number;
  filters: Record<string, string> | undefined;
  table?: Table<TData>;
};
export const TablePagination = <TData,>({
  table = undefined,
  totalPages = 1,
  filters,
}: PaginationProps<TData>) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );

  const prevFiltersRef = useRef(filters);

  const isMobile = useIsMobile();

  const currentPage = Number(searchParams.get("page")) || 1;

  const itemsPerPage = 5;
  const visiblePages = Array.from(
    { length: itemsPerPage },
    (_, i) => currentPage - 1 + i,
  ).filter((page) => page > 0 && page <= totalPages);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    } else {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleNext = () => {
    if (currentPage <= totalPages) handlePageChange(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage >= 1) {
      handlePageChange(currentPage - 1);
    }
  };

  useEffect(() => {
    const hasFiltersChanged =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);

    if (hasFiltersChanged) {
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    prevFiltersRef.current = filters;
  }, [params, pathname, router, filters]);

  const pageIndex = table?.getState().pagination.pageIndex ?? 0;
  const totalPagesFromTable = table?.getPageCount() ?? 0;

  const disabledClass = "pointer-events-none opacity-40 cursor-default";

  if (table)
    return (
      totalPagesFromTable > 1 && (
        <div className="flex flex-col items-center space-x-2 space-y-2 md:flex-row md:space-y-0">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                className={`${pageIndex === 0 && disabledClass} cursor-pointer border`}
                onClick={() => table?.previousPage()}
              />
              <span className="mx-1 space-x-2 text-xs font-medium">
                {pageIndex + 1} de {totalPagesFromTable}
              </span>
              <PaginationNext
                className={`${pageIndex + 1 === totalPagesFromTable && disabledClass} cursor-pointer border`}
                onClick={() => table?.nextPage()}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )
    );

  if (totalPages === 1) return <></>;

  if (isMobile) {
    return (
      <div className="flex flex-col items-center space-x-2 space-y-2 md:flex-row md:space-y-0">
        <Pagination>
          <PaginationContent className="flex-wrap">
            {currentPage > 2 && (
              <PaginationPrevious
                className="cursor-pointer"
                onClick={handlePrev}
              />
            )}

            {visiblePages.map((item) => {
              return (
                <PaginationItem
                  onClick={() => handlePageChange(item)}
                  key={item}
                  className="cursor-pointer"
                >
                  <PaginationLink isActive={currentPage === item}>
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {currentPage < totalPages && (
              <PaginationNext className="cursor-pointer" onClick={handleNext} />
            )}
          </PaginationContent>
        </Pagination>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-x-2 space-y-2 md:flex-row md:space-y-0">
      <Pagination>
        <PaginationContent>
          {currentPage > 2 && (
            <PaginationPrevious
              className="cursor-pointer"
              onClick={handlePrev}
              label="Anterior"
            />
          )}

          {currentPage > 5 && (
            <>
              <PaginationItem
                onClick={() => handlePageChange(1)}
                className="cursor-pointer"
              >
                <PaginationLink isActive={currentPage === 1}>1</PaginationLink>
              </PaginationItem>
              {currentPage > 2 && <PaginationEllipsis />}
            </>
          )}

          {visiblePages.map((item) => {
            return (
              <PaginationItem
                onClick={() => handlePageChange(item)}
                key={item}
                className="cursor-pointer"
              >
                <PaginationLink isActive={currentPage === item}>
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {currentPage < totalPages - 4 && (
            <>
              {currentPage < totalPages - 4 && <PaginationEllipsis />}
              <PaginationItem
                onClick={() => handlePageChange(totalPages)}
                className="cursor-pointer"
              >
                <PaginationLink isActive={currentPage === totalPages}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {currentPage < totalPages && (
            <PaginationNext
              className="cursor-pointer"
              onClick={handleNext}
              label="Próximo"
            />
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};
