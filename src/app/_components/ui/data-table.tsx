"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSort,
  type SortingState,
  type RowData,
  Table as TableType,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getExpandedRowModel,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import { TablePagination } from "./table-pagination";
import { Input } from "./input";
import { Search } from "lucide-react";
import { TbLayoutBottombarExpand, TbLayoutNavbarExpand } from "react-icons/tb";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useExpandedRowId } from "@/lib/store/ExpandedRowId";

type DataTableProps<TData extends RowData, TValue> = Readonly<{
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderExpandedRow?: (
    row: Row<TData>,
    table: TableType<TData>,
    searchValue?: string,
  ) => React.ReactNode;
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

export function DataTable<TData, TValue>({
  className,
  columns,
  data,
  renderExpandedRow,
  startSortingBy,
  pagination,
  showFooterTable = true,
  search,
}: DataTableProps<TData, TValue>) {
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
  const [expanded, setExpanded] = React.useState({});
  const { setExpandedRowId } = useExpandedRowId();

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
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => !!renderExpandedRow,
    state: {
      sorting,
      columnFilters,
      pagination: paginationData,
      expanded,
    },
  });

  React.useEffect(() => {
    if (search && renderExpandedRow) {
      const searchValue = table
        .getColumn(search.field)
        ?.getFilterValue() as string;
      if (searchValue) {
        const filteredRows = table.getFilteredRowModel().rows;
        if (filteredRows.length > 0) {
          const newExpanded: Record<string, boolean> = {};
          filteredRows.forEach((row) => {
            newExpanded[row.id] = true;
          });
          setExpanded(newExpanded);
          setExpandedRowId(filteredRows[0].id);
        } else {
          setExpanded({});
          setExpandedRowId(null);
        }
      } else {
        setExpanded({});
        setExpandedRowId(null);
      }
    }
  }, [columnFilters, search, renderExpandedRow, setExpandedRowId, table]);

  const handleExpandedRow = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    row: Row<TData>,
  ) => {
    if (renderExpandedRow) {
      row.getToggleExpandedHandler()();
      e.isPropagationStopped();
      if (row.getIsExpanded()) {
        setExpandedRowId(null);
        return;
      }
      setExpandedRowId(row.id);
      setExpanded({ [row.id]: true });
    }
  };

  const rows = table.getRowModel().rows;
  const allExpanded = rows.every((row) => row.getIsExpanded());
  const noneExpanded = rows.every((row) => !row.getIsExpanded());

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        {search && (
          <div className="flex w-full flex-col gap-2">
            <Input
              id="table-search"
              placeholder={search.placeholder}
              className="sm:w-1/2"
              value={
                (table.getColumn(search.field)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) => {
                const value = event.target.value;
                table.getColumn(search.field)?.setFilterValue(value);
                setSearchValue(value);
              }}
              leftIcon={<Search className="size-4" />}
            />
          </div>
        )}

        {!!renderExpandedRow && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={allExpanded}
                    onClick={() => {
                      const newExpanded: Record<string, boolean> = {};
                      table.getRowModel().rows.forEach((row) => {
                        newExpanded[row.id] = true;
                      });
                      table.setExpanded(newExpanded);
                    }}
                  >
                    <TbLayoutNavbarExpand className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expandir linhas</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={noneExpanded}
                    onClick={() => {
                      table.setExpanded({});
                    }}
                  >
                    <TbLayoutBottombarExpand className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Recolher linhas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
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
                <React.Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsExpanded() ? "open" : "closed"}
                    className={`group ${!!renderExpandedRow && "cursor-pointer"}
                      ${
                        row.getIsExpanded()
                          ? "bg-muted/20 font-semibold text-primary"
                          : "bg-background"
                      }`}
                    onClick={(e) => handleExpandedRow(e, row)}
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

                  {row.getIsExpanded() && renderExpandedRow && (
                    <TableRow className="hover:bg-transparant">
                      <TableCell
                        className="[&:has([role=checkbox])]:p-0"
                        colSpan={row.getVisibleCells().length}
                      >
                        {renderExpandedRow(row, table, searchValue)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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

          <TablePagination table={table} filters={undefined} />
        </div>
      )}
    </div>
  );
}
