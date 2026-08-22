"use client";

import { type ColumnDef } from "@tanstack/react-table";

type GeneralRegisterData = {
  tipo_ingresso: string
  vagas_ofertadas: string | number
  pendentes: string | number
  confirmados: string | number
  vagas_disponiveis: string | number
  valor_total: string | number
  a_receber: string | number
}

export const columns_general: ColumnDef<GeneralRegisterData>[] = [
  {
    accessorKey: "tipo_ingresso",
    header: "Opção de Ingresso",
  },
  {
    accessorKey: "vagas_ofertadas",
    header: "Vagas Ofertadas",
  },
  {
    accessorKey: "confirmados",
    header: "Confirmados",
  },
  {
    accessorKey: "pendentes",
    header: "Pendentes",
  },

  {
    accessorKey: "vagas_disponiveis",
    header: "Vagas Disponíveis",
  },

  {
    accessorKey: 'a_receber',
    header: 'Valor a Receber'
  },
  {
    accessorKey: "valor_total",
    header: "Valor Total",
  }
];
