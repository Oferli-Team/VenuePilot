"use client";

import { reais } from "@/lib/utils/money";
import { type ColumnDef } from "@tanstack/react-table";

type CuponsUsedData = {
  cupomName: string;
  totalUsed: number;
  percent: number;
  discountTotal: number;
};

const TextCenter = ({ value }: { value: string }) => (
  <p className="text-center">{value}</p>
);

export const ColumnCuponsUsed: ColumnDef<CuponsUsedData>[] = [
  {
    accessorKey: "cupomName",
    header: "Cupom",
  },
  {
    accessorKey: "totalUsed",
    header: () => <TextCenter value={"Total Utilizado"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("totalUsed")} />,
  },
  {
    accessorKey: "percent",
    header: () => <TextCenter value={"Porcentagem %"} />,
    cell: ({ row }) => (
      <TextCenter value={`${row.getValue("percent") / 100}%`} />
    ),
  },
  {
    accessorKey: "discountTotal",
    header: () => <TextCenter value={"Total de desconto"} />,
    cell: ({ row }) => (
      <TextCenter value={reais(row.getValue("discountTotal"))} />
    ),
  },
];
