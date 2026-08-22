"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSort,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { type InscricaoType } from "./column";

type DataTableProps = Readonly<{
  className?: string;
  columns: ColumnDef<InscricaoType>[];
  data: InscricaoType[];
  startSortingBy?: ColumnSort[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  showFooterTable?: boolean;
  search?: {
    field: string;
    placeholder: string;
  };
}>;

export function DataTable({
  className,
  columns,
  data,
  startSortingBy,
  pagination,
  showFooterTable = true,
  search,
}: DataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>(
    startSortingBy ?? [],
  );
  const [paginationData, setPaginationData] = React.useState({
    pageIndex: pagination?.pageIndex ?? 0, //initial page index
    pageSize: pagination?.pageSize ?? 50, //default page size
  });
  const [searchValue, setSearchValue] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPaginationData,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      pagination: paginationData,
    },
  });

  const getUniqueTopNumeroOptions = () => {
    const topNumeros = data.map((item) => item.topNumero).filter(Boolean);
    const tops = Array.from(new Set(topNumeros));
    return tops.map((top) => ({ value: top, label: top }));
  };

  return (
    <div className={cn("space-y-4 bg-card p-3", className)}>
      {search && (
        <div className="flex w-full flex-col gap-2">
          <Input
            placeholder={search.placeholder}
            className="sm:w-1/2"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              table.getColumn("multiSearch")?.setFilterValue(value);
            }}
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum dado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showFooterTable && (
        <div className="flex flex-col items-center justify-between space-x-2 pb-4 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            Exibindo {table.getRowModel().rows.length} de {data.length}{" "}
            resultados encontrado.
          </span>

          <TablePagination filters={{}} table={table} />
        </div>
      )}
    </div>
  );
}
