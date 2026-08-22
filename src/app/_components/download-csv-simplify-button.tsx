import React from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";
import { organizeColumns } from "@/lib/utils/organizeColumns";
import { type Inscricao } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { useInscricaoDetail } from "./inscricao-detail/useInscricaoDetailStore";
import { useDownloadRegisterCSV } from "@/lib/hooks/useDownloadRegistersCSV";

const fieldsToHide = [
  "cpf",
  "rg",
  "email",
  "celular",
  "rua",
  "ruaNumero",
  "bairro",
  "ruaComplemento",
  "nomeContatoEmergencia",
  "emailContatoEmergencia",
  "celularContatoEmergencia",
  "tipoVinculoContatoEmergencia",
];

type DownloadButton = ButtonProps["variant"];

type DownloadCSVButtonProps = {
  columns: ColumnDef<Inscricao, unknown>[];
  label?: string;
  variant?: DownloadButton;
};

export const DownloadCSVSimplifyButton = ({
  columns,
  label = "",
  variant = "outline",
}: DownloadCSVButtonProps) => {
  const { page } = useInscricaoDetail();

  const fields = organizeColumns(columns, page);

  const { handleExport, loading } = useDownloadRegisterCSV({
    fields: fields.filter((field) => field && !fieldsToHide.includes(field)),
  });

  return (
    <Button variant={variant} loading={loading} onClick={handleExport}>
      <span className="hidden sm:block">{label}</span>
      <ArrowDownToLine className="ml-1 h-4 w-4" />
    </Button>
  );
};
