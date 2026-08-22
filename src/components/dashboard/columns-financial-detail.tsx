"use client";

import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { type Inscricao } from "@prisma/client";
import { cn } from "@/lib/utils";
import { reais } from "@/lib/utils/money";
import { mask } from "remask";
import { MASK_PATTERN, paymentStatusOptions } from "@/lib/constants";
import {
  ENUM_EVENT_TYPE,
  ENUM_REGISTER_TYPE,
  type ENUM_PAYMENT_STATUS,
} from "@/lib/enum";
import { Badge } from "../ui/badge";
import { addColorByPaymentStatus } from "@/lib/utils/getStatusClass";

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

const registerTypeMap = {
  [ENUM_EVENT_TYPE.LEGENDARIOS]: {
    [ENUM_REGISTER_TYPE.PARTICIPANTE]: "Participante",
    [ENUM_REGISTER_TYPE.SERVIR]: "Legendário",
  },
  [ENUM_EVENT_TYPE.REM]: {
    [ENUM_REGISTER_TYPE.PARTICIPANTE]: "Casal Participante",
    [ENUM_REGISTER_TYPE.SERVIR]: "Casal Servir",
  },
};

type Data = Inscricao & { evento: { type: string } };
export const columnsFinancialDetail: ColumnDef<Data>[] = [
  {
    accessorKey: "cpf",
    id: "cpf",
    header: "CPF",
    cell: ({ row }) => (
      <TextCenter
        className="min-w-max"
        value={mask(row.getValue("cpf"), MASK_PATTERN.cpf)}
      />
    ),
  },
  {
    id: "nome",
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => {
      const value: string = row.getValue("nome");
      return <p className="min-w-48">{value}</p>;
    },
  },
  {
    id: "tipoInscricao",
    accessorKey: "tipoInscricao",
    header: "Inscrição",
    cell: ({ row }) => {
      const certificate = row.original.lgndCertificado;
      const eventoType = row.original.evento
        .type as keyof typeof registerTypeMap;
      const tipoInscricao = row.original
        .tipoInscricao as keyof (typeof registerTypeMap)[typeof eventoType];
      const label =
        registerTypeMap[eventoType]?.[tipoInscricao] ??
        row.getValue("tipoInscricao");

      return (
        <Badge
          variant="outline"
          className={`min-w-28 flex-col rounded-md p-1 text-center ${row.getValue("tipoInscricao") === "PARTICIPANTE" ? "bg-primary/20" : "bg-blue-600/20"}`}
        >
          <span>{label}</span>
          {tipoInscricao === ENUM_REGISTER_TYPE.SERVIR && (
            <span
              className={`text-xs ${certificate === true ? "text-success" : "text-muted-foreground"}`}
            >
              {certificate === true ? "Certificado" : "Não Certificado"}
            </span>
          )}
        </Badge>
      );
    },
  },
  {
    id: "pagamento_status",
    accessorKey: "pagamento_status",
    header: "Status de PGTO",
    cell: ({ row }) => {
      const pagamento_status: ENUM_PAYMENT_STATUS =
        row.getValue("pagamento_status");
      const status =
        paymentStatusOptions.find(({ value }) => value === pagamento_status)
          ?.label ?? "";
      return (
        <div className="flex min-w-32 justify-center">
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
  {
    id: "metodo_pagamento",
    accessorKey: "metodo_pagamento",
    header: "Método de PGTO",
    cell: ({ row }) => {
      const value: string = row.getValue("metodo_pagamento");
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className={cn("text-center")}>
            {value === "CUPOM_GRATUITO" ? "CUPOM" : value}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "pagamento_couponValue",
    accessorKey: "pagamento_couponValue",
    header: "Cupom Utilizado",
    cell: ({ row }) => {
      const value = row.getValue("pagamento_couponValue");
      return (
        <TextCenter
          className="text-xs"
          value={value === "none" ? "-" : value}
        />
      );
    },
  },
  {
    id: "pagamento_top_value",
    accessorKey: "pagamento_top_value",
    header: "$ Valor Evento",
    cell: ({ row }) => {
      const value: number = row.getValue("pagamento_top_value") ?? 0;
      return <TextCenter className="min-w-28" value={reais(value)} />;
    },
  },
  {
    id: "pagamento_discount_value",
    accessorKey: "pagamento_discount_value",
    header: "$ Desconto",
    cell: ({ row }) => {
      const value: number = row.getValue("pagamento_discount_value") ?? 0;
      return <TextCenter className="min-w-28" value={reais(value)} />;
    },
  },
  {
    id: "totalPaid",
    accessorKey: "totalPaid",
    header: "$ Valor Pago",
    cell: ({ row }) => {
      const value: number = row.getValue("totalPaid") ?? 0;
      return <TextCenter className="min-w-28" value={reais(value)} />;
    },
  },
  {
    id: "obs",
    accessorKey: "obs",
    header: "Observação",
    cell: ({ row }) => {
      return (
        <TextCenter className="w-64 text-wrap" value={row.getValue("obs")} />
      );
    },
  },
];
