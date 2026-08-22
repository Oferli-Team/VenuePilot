"use client";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { MASK_PATTERN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type Inscricao } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { mask } from "remask";
import { InternationalPhoneWppButton } from "@/components/international-phone-wpp-button";

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export type InscricaoType = {
  topNumero: string;
} & Pick<
  Inscricao,
  | "nome"
  | "cpf"
  | "celular"
  | "nrLgnd"
  | "email"
  | "cidade"
  | "estado"
  | "igreja"
  | "igrejaPastor"
>;

export const columns: ColumnDef<InscricaoType>[] = [
  {
    id: "multiSearch",
    header: "",
    accessorFn: (row) => row, // acessa o objeto completo
    cell: "",
    filterFn: (row, columnId, filterValue) => {
      const fields = ["nome", "nrLgnd", "cidade", "estado"];
      const search = filterValue.toLowerCase();

      return fields.some((field) => {
        const value = row.original[field as keyof typeof row.original];
        return (
          typeof value === "string" && value.toLowerCase().includes(search)
        );
      });
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "topNumero",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 px-2"
      >
        TOP
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TextCenter value={row.getValue("topNumero") ?? "-"} />,
    enableSorting: true,
    filterFn: "equalsString",
  },
  {
    accessorKey: "nrLgnd",
    header: () => <TextCenter className="w-max" value="Número LGND" />,
    cell: ({ row }) => <TextCenter value={row.getValue("nrLgnd")} />,
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 px-2"
      >
        Nome
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <p className="flex h-8 w-max items-center text-center">
        {row.getValue("nome")}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "equalsString",
  },
  {
    accessorKey: "cpf",
    header: () => <TextCenter value="Documento" />,
    cell: ({ row }) => (
      <div className="flex min-w-max items-center gap-1">
        <TextCenter value={mask(row.getValue("cpf"), MASK_PATTERN.cpf)} />
        <CopyButton textToCopy={row.getValue("cpf")} />
      </div>
    ),
  },
  {
    id: "celular",
    accessorKey: "celular",
    header: () => <TextCenter value="Celular" />,
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.celular ?? ""}
      />
    ),
  },
  {
    accessorKey: "cidade",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full p-0 px-2"
      >
        Cidade
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TextCenter
        className="flex w-full min-w-max justify-center"
        value={`${row.original.cidade}/${row.original.estado}`}
      />
    ),
    enableColumnFilter: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "estado",
    header: "",
    cell: "",
    enableColumnFilter: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "igreja",
    header: () => "Igreja",
    cell: ({ row }) => (
      <TextCenter className="w-48 text-start" value={row.getValue("igreja")} />
    ),
  },
  {
    accessorKey: "igrejaPastor",
    header: () => <TextCenter value="Líder espiritual" />,
    cell: ({ row }) => (
      <TextCenter className="w-max px-6" value={row.getValue("igrejaPastor")} />
    ),
  },
  {
    accessorKey: "email",
    header: () => "E-mail",
    cell: ({ row }) => row.getValue("email"),
  },
];
