"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { type Inscricao } from "@prisma/client";
import { type Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { funcoesLgndOptions } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";

type SelectFamilyProps = {
  row: Row<Inscricao>;
};

export const SelectLgndJob = ({ row }: SelectFamilyProps) => {
  const { invalidateDataTablePagination } = useInvalidateQueries();

  const updateLgndFuncao = api.inscricao.updateInscricaoLgndFuncao.useMutation({
    async onSuccess() {
      await invalidateDataTablePagination();
    },
  });

  const lgndFuncaoValue = row.original.lgnd_funcao;

  const defaultValue =
    lgndFuncaoValue === null || lgndFuncaoValue === undefined
      ? "Nenhum"
      : lgndFuncaoValue?.toString();

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue,
  );
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleFamiliaChange = (value: string) => {
    setSelectedValue(value);
    setOpenDialog(true);
    setOpen(false);
  };

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const id = row.original.id;
    try {
      await updateLgndFuncao.mutateAsync({
        id: id,
        lgnd_funcao: ["Nenhum", "-", "null"].includes(selectedValue!)
          ? null
          : selectedValue,
      });
      toast({
        title: "Sucesso",
        description: `Função atualizada com sucesso!`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating lgnd funcao:", error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar a Função.`,
        variant: "destructive",
      });
    } finally {
      handleDialogClose(e);
    }
  };

  const handleDialogClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDialog(false);
    setSelectedValue(defaultValue);
  };

  useEffect(() => {
    const newValue =
      row.getValue("lgnd_funcao") === null
        ? "Nenhum"
        : row.getValue("lgnd_funcao")?.toString();
    setSelectedValue(newValue);
  }, [row.getValue("lgnd_funcao")]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            e.stopPropagation()
          }
          className="flex min-h-10 w-full min-w-36 items-center justify-between overflow-hidden rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
          role="combobox"
          aria-expanded={open}
        >
          {selectedValue === "Nenhum"
            ? " - "
            : (funcoesLgndOptions.find(
                (option) => option.value === selectedValue,
              )?.label ?? "Selecione")}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command className="space-y-2">
            <CommandInput placeholder="Procure pela função" className="h-12" />
            <CommandList>
              <CommandEmpty>Não encontrado.</CommandEmpty>
              <CommandGroup onClick={(e) => e.stopPropagation()}>
                {funcoesLgndOptions.map((option, i) => (
                  <CommandItem
                    key={`${option.value} - ${i + 1}`}
                    value={
                      String(option.value) === "Nenhum"
                        ? "-"
                        : String(option.value)
                    }
                    className="h-10"
                    onSelect={handleFamiliaChange}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedValue === option.label
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Certeza que deseja alterar a função do legendário -{" "}
              <b>{row.original.nome}</b>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancelar
            </Button>
            <Button
              loading={updateLgndFuncao.isPending}
              onClick={handleConfirm}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
