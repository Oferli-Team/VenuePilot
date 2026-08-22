"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MASK_PATTERN, paymentStatusOptions } from "@/lib/constants";
import type { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { cn } from "@/lib/utils";
import {
  addColorByPaymentStatus,
  getStatusClass,
} from "@/lib/utils/getStatusClass";
import { type Inscricao } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { Receipt } from "lucide-react";
import { mask } from "remask";

const TextCenter = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => (
  <div
    className={cn("flex items-center justify-center text-center", className)}
  >
    {value}
  </div>
);

type ColumnType = Pick<
  Inscricao,
  | "nome"
  | "cpf"
  | "status"
  | "pagamento_status"
  | "obs"
  | "tipoInscricao"
  | "pagamento_link_url"
  | "reembolso_description"
  | "reembolso_status"
  | "reembolso_receipt"
>;

export const getCanceladosColumns = (
  data: ColumnType[],
): ColumnDef<ColumnType>[] => {
  const columns: ColumnDef<ColumnType>[] = [
    {
      accessorKey: "tipoInscricao",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Inscrição
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`rounded-md p-1 ${row.getValue("tipoInscricao") === "PARTICIPANTE" ? "bg-primary/20 text-muted-foreground" : "bg-blue-600/20 text-muted-foreground"}`}
        >
          {row.getValue("tipoInscricao") === "PARTICIPANTE"
            ? "PARTICIPANTE"
            : "LEGENDÁRIO"}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "cpf",
      header: () => <TextCenter value={"CPF"} />,
      cell: ({ row }) => (
        <TextCenter
          className="w-max"
          value={mask(row.getValue("cpf"), MASK_PATTERN.cpf)}
        />
      ),
    },
    {
      accessorKey: "status",
      header: () => <TextCenter value={"Status"} />,
      cell: ({ row }) => {
        const value: string = row.getValue("status");
        const status = value.split("_")[0];
        return (
          <div className="flex items-center justify-center">
            <Badge
              variant="secondary"
              className={getStatusClass(value as ENUM_STATUS)}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "pagamento_status",
      header: () => <TextCenter value={"Pagamento"} />,
      id: "pagamento_status",
      cell: ({ row }) => {
        const pagamento_status: ENUM_PAYMENT_STATUS =
          row.getValue("pagamento_status");
        const status =
          paymentStatusOptions.find(({ value }) => value === pagamento_status)
            ?.label ?? "";
        return (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={cn(
                "text-center",
                addColorByPaymentStatus(pagamento_status, "bg"),
              )}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
  ];

  const isRefunded = data.some((r) => r.reembolso_status !== null);

  if (isRefunded) {
    columns.push({
      accessorKey: "reembolso_description",
      header: () => <TextCenter value={"Motivo"} />,
      cell: ({ row }) => (
        <TextCenter
          className="max-w-64"
          value={row.getValue("reembolso_description") ?? "Não informado"}
        />
      ),
    });
  } else {
    columns.push({
      accessorKey: "obs",
      header: () => <TextCenter value={"Observação"} />,
      cell: ({ row }) => (
        <TextCenter className="max-w-64" value={row.getValue("obs") ?? "-"} />
      ),
    });
  }

  const hasPaymentReceiptAndNotRefund = data.some(
    (r) => r.pagamento_link_url && !r.reembolso_status,
  );
  if (hasPaymentReceiptAndNotRefund) {
    columns.push({
      accessorKey: "pagamento_link_url",
      header: () => <TextCenter value={"Comprovante Pag."} />,
      cell: ({ row }) => {
        const link: string | undefined = row.getValue("pagamento_link_url");

        return (
          <div className="flex justify-center text-muted-foreground">
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Receipt className="size-6" />
              </a>
            ) : (
              "-"
            )}
          </div>
        );
      },
    });
  }

  const hasRefundReceipt = data.some((d) => d.reembolso_receipt);
  if (hasRefundReceipt) {
    columns.push({
      accessorKey: "reembolso_receipt",
      header: () => <TextCenter value={"Comprovante Reemb."} />,
      cell: ({ row }) => {
        const refundLink: string | undefined =
          row.getValue("reembolso_receipt");

        return (
          <div className="flex justify-center text-muted-foreground">
            {refundLink ? (
              <a href={refundLink} target="_blank" rel="noopener noreferrer">
                <Receipt className="size-6" />
              </a>
            ) : (
              "-"
            )}
          </div>
        );
      },
    });
  }

  return columns;
};
