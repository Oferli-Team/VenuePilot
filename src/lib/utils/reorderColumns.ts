import { type ColumnDefResolved } from "@tanstack/react-table";

export function reorderColumns<TData>(
  columns: ColumnDefResolved<TData>[],
  desiredOrder: string[],
): ColumnDefResolved<TData>[] {
  const columnMap = new Map<string, ColumnDefResolved<TData>>();

  columns.forEach((col) => columnMap.set(col.id ?? col.accessorKey!, col));

  const reorderedColumns = desiredOrder
    .map((key) => columnMap.get(key))
    .filter((col): col is ColumnDefResolved<TData> => Boolean(col));

  return reorderedColumns;
}
