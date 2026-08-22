"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selects";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { type Inscricao } from "@prisma/client";
import { type Row, type Table } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  hakunaClassificationOptions,
  valueColorMapping,
} from "./hakuna-classification-sidebar";
import { Cross } from "lucide-react";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isHakuna } from "@/lib/utils/hasRole";

type SelectHealthProps = {
  row: Row<Inscricao>;
};

export const SelectHealth = ({ row }: SelectHealthProps) => {
  const { membership } = getCurrentMembership();

  const { event } = useEventStore();
  const { invalidateHealth } = useInvalidateQueries();

  const updateSaude = api.inscricao.updateInscricaoWithSaude.useMutation({
    async onSuccess() {
      await invalidateHealth();
    },
  });

  const defaultValue =
    row.getValue("saude") === null
      ? "Nenhum"
      : row.getValue("saude")?.toString();

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue,
  );
  const [open, setOpen] = useState(false);

  const handleSaudeChange = (value: string) => {
    setSelectedValue(value);
    setOpen(true);
  };

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const id = row.original.id;
    try {
      if (!event?.id) return;

      await updateSaude.mutateAsync({
        inscricaoId: id,
        eventoId: event.id,
        saude:
          selectedValue === "Nenhum" || selectedValue === "-"
            ? null
            : Number(selectedValue),
      });

      setOpen(false);
      toast({
        title: "Sucesso",
        description: `Classificação saúde atualizado com sucesso!`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating saúde:", error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar classificação de saúde`,
        variant: "destructive",
      });
    } finally {
      setSelectedValue(defaultValue);
    }
  };

  useEffect(() => {
    const newValue =
      row.getValue("saude") === null || row.getValue("saude") === undefined
        ? "Nenhum"
        : row.getValue("saude")?.toString();
    setSelectedValue(newValue);
  }, [row.getValue("saude")]);

  const isHakunaRole = isHakuna(membership);

  const rowSaudeValue = row.getValue("saude")?.toString();

  return (
    <>
      <div className="z-30 flex items-center justify-center">
        {!isHakunaRole ? (
          <div className="flex items-center justify-center  gap-3 self-center rounded-md bg-muted/70 p-2">
            <Cross
              size={16}
              className={`${rowSaudeValue !== undefined && valueColorMapping[rowSaudeValue]}`}
            />
            {rowSaudeValue ?? "-"}
          </div>
        ) : (
          <Select value={selectedValue} onValueChange={handleSaudeChange}>
            <SelectTrigger size="sm">
              <SelectValue>
                <span className="flex items-center gap-3">
                  <Cross
                    size={16}
                    className={`${selectedValue !== undefined && valueColorMapping[selectedValue]}`}
                  />
                  {selectedValue === "-" || selectedValue === "Nenhum"
                    ? "-"
                    : selectedValue}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {hakunaClassificationOptions.map((option) => (
                <SelectItem
                  size="sm"
                  key={option.value}
                  value={
                    option.value.toString() === "Nenhum"
                      ? "-"
                      : option.value.toString()
                  }
                >
                  <span className="flex items-center gap-3">
                    <Cross size={16} className={`${option.color}`} />
                    {option.value}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Certeza que deseja alterar a classficação de Saúde do participante
              - <b>{row?.original?.nome ?? ""}</b>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button loading={updateSaude.isPending} onClick={handleConfirm}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
