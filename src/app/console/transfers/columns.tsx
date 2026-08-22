"use client";

import React, { type ReactNode } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { reais } from "@/lib/utils/money";
import { Info, ReceiptIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusClassName = (value: string) => {
  if (value === "DONE") {
    return "text-success bg-green-500/5";
  }
  if (value === "PENDING") {
    return "text-orange-600 bg-orange-500/5";
  }

  return "text-destructive bg-destructive/5";
};

type ColumnDefTransfer = {
  status: string;
  id: string;
  value: number;
  dateCreated: string;
  effectiveDate: string | null;
  confirmedDate: string | null;
  endToEndIdentifier: string | null;
  transactionReceiptUrl: string | null;
  operationType: string;
  failReason: string | null;
  description: string | null;
  canBeCancelled: boolean;
  authorized: boolean;
  accountName: string | null;
  ownerName: string;
};

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <p className={cn("text-center", className)}>{value}</p>;

const Link = ({
  value,
  label,
  className,
}: {
  value: string;
  label: string | ReactNode;
  className?: string;
}) => (
  <a target="_blank" href={value} className={cn("text-center", className)}>
    {label}
  </a>
);

export const columns: ColumnDef<ColumnDefTransfer>[] = [
  {
    accessorKey: "status",
    header: () => <TextCenter value={"Status"} />,
    cell: ({ row }) => {
      const value = row.original.status;
      if (value === "DONE") {
        return (
          <TextCenter
            className={`flex justify-center rounded-md p-1 font-semibold ${statusClassName(value)}`}
            value={value}
          />
        );
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className={`flex justify-center gap-1 rounded-md p-1 font-semibold ${statusClassName(value)}`}
            >
              <Info className="h-2 w-2" />
              <p>{value}</p>
            </TooltipTrigger>
            <TooltipContent>{row.original.failReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "ownerName",
    header: "Enviado para",
    cell: ({ row }) => row.getValue("ownerName"),
  },
  {
    accessorKey: "operationType",
    id: "operationType",
    header: () => <TextCenter value={"Método"} />,
    cell: ({ row }) => {
      const value = row.getValue("operationType") ?? "";
      return <TextCenter value={value} />;
    },
  },
  {
    accessorKey: "value",
    header: () => <TextCenter value={"Valor"} />,
    cell: ({ row }) => {
      const value = row.getValue("value") ?? "";
      return <TextCenter value={reais(String(value))} />;
    },
  },
  {
    accessorKey: "description",
    header: () => <TextCenter value={"Descrição"} />,
    cell: ({ row }) => {
      const value = row.getValue("description") ?? "";
      return <TextCenter value={value} />;
    },
  },
  {
    accessorKey: "transactionReceiptUrl",
    header: () => <TextCenter value={"Comprovante"} />,
    cell: ({ row }) => {
      const value = row.getValue("transactionReceiptUrl");
      if (!value) return <></>;
      return (
        <Link
          className="flex items-center justify-center"
          label={<ReceiptIcon className="text-primary" />}
          value={value}
        />
      );
    },
  },
  {
    accessorKey: "dateCreated",
    header: () => <TextCenter value={"Criado"} />,
    cell: ({ row }) => (
      <TextCenter className="w-max" value={row.getValue("dateCreated")} />
    ),
  },
  {
    accessorKey: "confirmedDate",
    header: () => <TextCenter value={"Confirmado"} />,
    cell: ({ row }) => (
      <TextCenter className="w-max" value={row.getValue("confirmedDate")} />
    ),
  },
];
