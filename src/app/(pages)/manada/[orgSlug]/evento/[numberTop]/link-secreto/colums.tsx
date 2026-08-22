"use client";

import { ActiveSecretLink } from "@/components/active-secret-link";
import { LinkSecretoAction } from "@/components/link-secreto-action";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useEventStore } from "@/lib/store/EventStore";
import { cn } from "@/lib/utils";
import { type LinkSecreto } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { type ColumnDef, type Row } from "@tanstack/react-table";

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

const LinkRedirectAndCopyButton = ({ row }: { row: Row<LinkSecreto> }) => {
  const { event } = useEventStore();
  const isMobile = useIsMobile();

  const baseUrl = `inscricoestop.com.br/evento/${event?.topNumero}/`;

  return (
    <div className="flex items-center gap-1">
      <CopyButton textToCopy={`${baseUrl + row.getValue("link")}`} />
      <a
        target="_blank"
        className="hover:underline"
        href={`/evento/${event?.topNumero}/${row.getValue("link")}`}
      >
        {isMobile
          ? baseUrl.endsWith(event?.topNumero?.toString() ?? "")
          : baseUrl}
        <span className={"text-primary"}>{row.getValue("link")}</span>
      </a>
    </div>
  );
};

export const columns: ColumnDef<LinkSecreto>[] = [
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => <LinkRedirectAndCopyButton row={row} />,
  },
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
      <TextCenter
        value={row.getValue("tipoInscricao")}
        className={`rounded-md p-1 ${row.getValue("tipoInscricao") === "PARTICIPANTE" ? "bg-orange-500/5 text-orange-600" : "bg-blue-600/5 text-blue-600"}`}
      />
    ),
    enableSorting: true,
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
    cell: ({ row }) => <ActiveSecretLink row={row} />,
    enableSorting: true,
  },
  {
    accessorKey: "actions",
    header: "",
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => <LinkSecretoAction data={row.original} />,
  },
];
