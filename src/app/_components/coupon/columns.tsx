"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CouponAction } from "../counpon-action";
import { type CupomDesconto } from "@prisma/client";
import { ActiveCupomDesconto } from "../active-cupom-desconto";
import React from "react";
import { Button } from "../ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { CopyButton } from "../ui/copy-button";

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export const columns: ColumnDef<CupomDesconto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <CopyButton textToCopy={row.getValue("codigo")} />
        <span className="text-primary">{row.getValue("codigo")}</span>
      </div>
    ),
  },
  {
    accessorKey: "quantidade",
    header: () => <TextCenter value={"Total Criado"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("quantidade")} />,
  },
  {
    accessorKey: "usadoCount",
    header: () => <TextCenter value={"Total Usado"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("usadoCount")} />,
  },
  {
    accessorKey: "quantidadeDisponivel",
    header: () => <TextCenter value={"Total Disponível"} />,
    cell: ({ row }) => (
      <TextCenter value={row.getValue("quantidadeDisponivel")} />
    ),
  },
  {
    accessorKey: "desconto",
    header: () => <TextCenter value={"% Porcentagem"} />,
    cell: ({ row }) => (
      <TextCenter value={`${(row.getValue("desconto")) / 100}%`} />
    ),
  },
  {
    accessorKey: "ativo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ativo
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => <ActiveCupomDesconto row={row} />,
    enableSorting: true,
  },
  {
    accessorKey: "actions",
    header: "",
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => <CouponAction data={row.original} />,
  },
];
