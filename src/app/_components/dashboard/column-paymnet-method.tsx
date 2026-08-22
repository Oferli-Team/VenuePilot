"use client";

import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export type columnsPaymentMethodProps = {
  tipoInscricao: string;
  pix: number;
  creditCard: number;
  free: number;
  total: number;
};

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export const columnsPaymentMethod: ColumnDef<columnsPaymentMethodProps>[] = [
  {
    accessorKey: "tipoInscricao",
    header: "Inscrição",
  },
  {
    accessorKey: "pix",
    header: () => <TextCenter value={"Pix"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("pix")} />,
  },
  {
    accessorKey: "creditCard",
    header: () => <TextCenter value={"Cartão de Crédito"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("creditCard")} />,
  },
  {
    accessorKey: "free",
    header: () => <TextCenter value={"Gratuitos"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("free")} />,
  },
  {
    accessorKey: "total",
    header: () => <TextCenter value={"Total"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("total")} />,
  },
];
