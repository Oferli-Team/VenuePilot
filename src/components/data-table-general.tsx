"use client";

import * as React from "react";
import { useModalStore } from "@/lib/store/ModalStore";
import { useInscricaoDetail } from "./inscricao-detail/useInscricaoDetailStore";
import { cn } from "@/lib/utils";
import { reorderColumns } from "@/lib/utils/reorderColumns";
import { type Inscricao } from "@prisma/client";
import {
  type Row,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSort,
  type SortingState,
  type VisibilityState,
  type RowData,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Columns3, X } from "lucide-react";
import { VISIBLE_COLUMNS } from "@/lib/constants";

import { TablePagination } from "@/components/ui/table-pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

import { FilterTable } from "./filter-table";
import { DownloadCSVButton } from "./download-csv-button";
import { DownloadCSVSimplifyButton } from "./download-csv-simplify-button";
import { SaudeObsModal } from "./hakuna/saude-obs-modal";
import { LettersObsModal } from "./cartas/letters-obs-modal";
import { CheckinObsModal } from "./checkin/checkin-modal";
import { InputSearch } from "./input-search";
import { FiltersActiveBadge } from "./filter-active-badge";
import { TablePaginationTotalItems } from "./ui/table-pagination-total-items";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    visibleColumnPage: keyof typeof VISIBLE_COLUMNS;
  }
}

type DataTableProps<TData extends RowData, TValue> = Readonly<{
  className?: string;
  totalPages?: number;
  totalItems?: number;
  filters?: Record<string, string>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  showDownloadBtn?: boolean;
  showDownloadSimplifyBtn: boolean;
  showSearchInput?: boolean;
  startSortingBy?: ColumnSort[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  visibleColumnPage: keyof typeof VISIBLE_COLUMNS;
  columnsHiding?: string[];
  sidebar?: React.ReactNode;
}>;

export function DataTable<TData, TValue>({
  className,
  totalPages,
  totalItems,
  filters,
  columns,
  data,
  onRowClick,
  startSortingBy,
  showDownloadBtn = true,
  showDownloadSimplifyBtn = true,
  showSearchInput = true,
  pagination,
  visibleColumnPage,
  columnsHiding = [],
  enableRowSelection,
  sidebar,
}: DataTableProps<TData, TValue>) {
  const { handleClickModals, setIsOpenDrawer, setIsOpenSheet, setPage } =
    useInscricaoDetail();

  const { setInscricao, isModalOpen } = useModalStore();

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

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const visibleColumns = VISIBLE_COLUMNS[visibleColumnPage] ?? [];

      // Colunas a serem ocultadas com base em columnsHiding
      const hiddenColumns = columnsHiding ?? [];

      return columns.reduce((acc, column) => {
        const key = (column as { accessorKey?: string }).accessorKey;

        if (key) {
          // Se a coluna estiver em `visibleColumns`, a visibilidade será true (visível por padrão)
          // Caso contrário, se estiver em `columnsHiding`, a visibilidade será false (oculta por padrão)
          acc[key] =
            visibleColumns.includes(key) && !hiddenColumns.includes(key);
        }
        return acc;
      }, {} as VisibilityState);
    });

  const reorderCol = React.useMemo(() => {
    const columnsReordered = reorderColumns(
      columns,
      VISIBLE_COLUMNS[visibleColumnPage],
    );
    return columnsReordered;
  }, [columns, visibleColumnPage]);

  const table = useReactTable({
    data,
    columns: reorderCol,
    enableRowSelection: enableRowSelection,
    meta: {
      visibleColumnPage: visibleColumnPage,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPaginationData,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: paginationData,
    },
  });

  const formatVisibleColumnLabel = (columnId: string): string => {
    if (columnId === "cpf" || columnId === "cep" || columnId === "imc") {
      return columnId.toUpperCase();
    }
    const label = columnId
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Adiciona espaço antes de maiúsculas em camelCase
      .replace(/_/g, " "); // Substitui underscores por espaços

    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  React.useEffect(() => {
    setIsOpenDrawer(false);
    setIsOpenSheet(false);
    setPage(visibleColumnPage);
  }, [setIsOpenDrawer, setIsOpenSheet, setPage, visibleColumnPage]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {showSearchInput && <InputSearch />}
          <div className="flex w-full items-center justify-end gap-2 self-baseline">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-fit">
                  <Columns3 className="h-4 w-4" />
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <ScrollArea className="h-64">
                  {VISIBLE_COLUMNS[visibleColumnPage].map((columnId) => {
                    const column = table
                      .getAllColumns()
                      .find((col) => col.id === columnId);
                    if (!column) return null;

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(e) => e.preventDefault()}
                      >
                        {formatVisibleColumnLabel(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <FilterTable
              table={table}
              visibleColumns={VISIBLE_COLUMNS[visibleColumnPage]}
            />

            <DownloadCSVButton
              columns={columns as ColumnDef<Inscricao>[]}
              variant="outline"
              showDownloadBtn={showDownloadBtn}
              showDownloadSimplifyBtn={showDownloadSimplifyBtn}
            />
          </div>
        </div>

        <FiltersActiveBadge filters={filters} />
      </div>

      {/* table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={`${sidebar && "cursor-pointer"}`}
              >
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
                  onClick={() => {
                    onRowClick && onRowClick(row.original);
                    handleClickModals(row as Row<Inscricao>);
                  }}
                  onMouseEnter={() => setInscricao(row.original as Inscricao)}
                  className={`${(onRowClick ?? !!sidebar) ? "cursor-pointer" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}

                  {isModalOpen("checkIn_obs", row.original as Inscricao) && (
                    <CheckinObsModal inscricao={row.original as Inscricao} />
                  )}

                  {isModalOpen("letters_obs", row.original as Inscricao) && (
                    <LettersObsModal inscricao={row.original as Inscricao} />
                  )}

                  {isModalOpen("health_obs", row.original as Inscricao) && (
                    <SaudeObsModal inscricao={row.original as Inscricao} />
                  )}
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

      <div className="flex flex-col items-center justify-between gap-6 space-x-2 pb-4 md:flex-row">
        <div className="flex items-center gap-3 ">
          <TablePaginationTotalItems />

          <div className="flex flex-col gap-2">
            {totalItems && totalItems > 0 ? (
              <span className="text-xs text-muted-foreground">
                Exibindo {table.getRowModel().rows.length} de {totalItems}{" "}
                {totalItems > 1 ? "registros" : "registro"} encontrado.
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Nenhum registro encontrado.
              </span>
            )}
          </div>
        </div>

        <TablePagination filters={filters} totalPages={totalPages ?? 1} />
      </div>

      {React.isValidElement(sidebar)
        ? React.cloneElement(sidebar, { table })
        : sidebar}
    </div>
  );
}
