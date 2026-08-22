import React from "react";
import { Button, type ButtonProps } from "./ui/button";
import { organizeColumns } from "@/lib/utils/organizeColumns";
import { type Inscricao } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { useInscricaoDetail } from "./inscricao-detail/useInscricaoDetailStore";
import { ArrowDownToLine, Columns4, FileDown } from "lucide-react";
import { useDownloadRegisterCSV } from "@/lib/hooks/useDownloadRegistersCSV";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Switch } from "./ui/switch";
import { GridThreeColumns } from "./grid-three-column";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { fieldHeaderLabelMap } from "@/lib/constants";
import { toast } from "./ui/use-toast";

type DownloadCSVButtonProps = {
  columns: ColumnDef<Inscricao, unknown>[];
  variant?: ButtonProps["variant"];
  showDownloadSimplifyBtn?: boolean;
  showDownloadBtn?: boolean;
};

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

const defaultValues = {
  status: true,
  createdAt: true,
  nrRem: true,
  nrLgnd: true,
  nome: true,
  cpf: true,
  email: true,
  celular: true,
  manTshirtSize: true,
  spouseName: true,
  spouseCPF: true,
  spouseEmail: true,
  womanTshirtSize: true,
  obs: true,
};

export const DownloadCSVButton = ({
  columns,
  variant = "outline",
  showDownloadBtn = true,
  showDownloadSimplifyBtn = true,
}: DownloadCSVButtonProps) => {
  const { page } = useInscricaoDetail();
  const { handleExport, loading } = useDownloadRegisterCSV();

  const fields = organizeColumns(columns, page);

  const [open, setOpen] = React.useState(false);
  const [checkedValues, setCheckedValues] = React.useState(defaultValues);

  const handleCheckChange = (field: string, checked: boolean) => {
    setCheckedValues({ ...checkedValues, [field]: checked });
  };

  const handleFieldsToExport = async () => {
    const values = Object.entries(checkedValues)
      .filter(([_, value]) => !!value)
      .flat()
      .filter((val) => typeof val === "string");

    if (values.length <= 0) {
      toast({
        title: "Erro na operação",
        description: "Mínimo uma coluna deve ser selecionada",
        variant: "destructive",
      });
      return;
    }

    const columnsFiltered = fields.filter((field) =>
      field ? values.includes(field ?? "") : "",
    );

    if (columnsFiltered.length > 0) {
      const fields = columnsFiltered.filter((col) => col !== undefined);
      await handleExport(fields);
      return;
    }

    toast({
      title: "Erro na operação",
      description: "Mínimo uma coluna deve ser selecionada",
      variant: "destructive",
    });
  };

  const handleCompleteExport = async () => {
    const _fields = fields.filter((col) => col !== undefined);
    await handleExport(_fields);
  };

  const handleSimplifyExport = async () => {
    const _fields = fields
      .filter((field) => field && !fieldsToHide.includes(field))
      .filter((col) => col !== undefined);
    await handleExport(_fields);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            loading={loading}
            hidden={!showDownloadBtn || !showDownloadSimplifyBtn}
          >
            Exportar
            <ArrowDownToLine className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full" align="end">
          <DropdownMenuLabel>Exportar Relatório</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-4" onClick={handleCompleteExport}>
            Gerar relatório completo
            <DropdownMenuShortcut>
              <FileDown className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-4" onClick={() => setOpen(true)}>
            Escolher colunas e gerar relatório
            <DropdownMenuShortcut>
              <Columns4 className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-4" onClick={handleSimplifyExport}>
            Gerar relatório simplificado
            <DropdownMenuShortcut>
              <FileDown className="size-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger />
        <SheetContent className="w-full sm:w-3/4 sm:max-w-xl">
          <SheetHeader className="space-y-1">
            <SheetTitle>Relatório</SheetTitle>
            <SheetDescription>
              Escolha as colunas que deseja no relatório
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[80vh] w-full">
            <GridThreeColumns className="grid-cols-2 py-2">
              {fields
                .filter(
                  (field) =>
                    field &&
                    !["actions", "index"].includes(field.toLowerCase()),
                )
                .map((field, i) => {
                  const customLabel = field && fieldHeaderLabelMap[field];
                  const label = field
                    ? field
                        .replace(/([A-Z])/g, " $1")
                        .replaceAll("_", " ")
                        .trim()
                    : "";

                  return (
                    <div
                      key={`${field} - ${i + 1}`}
                      className="flex flex-col gap-1"
                    >
                      <Label className="text-xs capitalize">
                        {customLabel ?? label}
                      </Label>
                      <Switch
                        value={field}
                        checked={checkedValues[field] ?? false}
                        onCheckedChange={(checked) =>
                          handleCheckChange(field, checked)
                        }
                      />
                    </div>
                  );
                })}
            </GridThreeColumns>
          </ScrollArea>
          <SheetFooter className="pt-4">
            <Button
              loading={loading}
              onClick={handleFieldsToExport}
              className="w-full"
            >
              Exportar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
