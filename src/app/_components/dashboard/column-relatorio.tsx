"use client";

import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { type CupomDesconto } from "@prisma/client";
import { cn } from "@/lib/utils";
import { reais } from "@/lib/utils/money";

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export const columns: ColumnDef<CupomDesconto>[] = [
  {
    accessorKey: "tipoInscricao",
    header: "Tipo de Inscrição",
  },
  {
    accessorKey: "totalRegisterFree",
    header: () => <TextCenter value={"Qtd. gratuitos"} />,
    cell: ({ row }) => (
      <TextCenter className="py-2" value={row.getValue("totalRegisterFree")} />
    ),
  },
  {
    accessorKey: "totalRegisterWithDiscount",
    header: () => <TextCenter value={"Qtd. com desconto"} />,
    cell: ({ row }) => (
      <TextCenter value={row.getValue("totalRegisterWithDiscount")} />
    ),
  },
  {
    accessorKey: "totalRegisterNoDiscount",
    header: () => <TextCenter value={"Qtd. valor integral"} />,
    cell: ({ row }) => (
      <TextCenter value={row.getValue("totalRegisterNoDiscount")} />
    ),
  },
  {
    accessorKey: "totalRegister",
    header: () => <TextCenter value={"Total Inscritos"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("totalRegister")} />,
  },
  {
    accessorKey: "salesWithDiscount",
    header: () => <TextCenter value={"R$ com desconto"} />,
    cell: ({ row }) => {
      const value: number = row.getValue("salesWithDiscount") ?? 0;
      return <TextCenter value={reais(value)} />;
    },
  },
  {
    accessorKey: "salesNoDiscount",
    header: () => <TextCenter value={"R$ valor integral (sem desconto)"} />,
    cell: ({ row }) => {
      const value: number = row.getValue("salesNoDiscount") ?? 0;
      return <TextCenter value={reais(value)} />;
    },
  },
  {
    accessorKey: "totalSales",
    header: () => <TextCenter value={"Total das vendas"} />,
    cell: ({ row }) => {
      const value: number = row.getValue("totalSales") ?? 0;
      return <TextCenter value={reais(value)} />;
    },
  },
  {
    accessorKey: "valueToPassOn",
    header: () => <TextCenter value={"Valor do organizador"} />,
    cell: ({ row }) => {
      const value: number = row.getValue("valueToPassOn") ?? 0;
      return <TextCenter value={reais(value)} />;
    },
  },
];
