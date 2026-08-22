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
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { familiaOptions } from "@/lib/constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";

type SelectFamilyProps = {
  row: Row<Inscricao>;
};

export const SelectFamily = ({ row }: SelectFamilyProps) => {
  const { invalidateFamily } = useInvalidateQueries();

  const pathname = usePathname();
  const updateFamilia = api.inscricao.updateFamilia.useMutation({
    async onSuccess() {
      await invalidateFamily();
    },
  });

  const defaultValue =
    row.getValue("familia") === null
      ? "Nenhum"
      : row.getValue("familia")?.toString();

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue,
  );
  const [open, setOpen] = useState(false);

  const handleFamiliaChange = (value: string) => {
    setSelectedValue(value);
    setOpen(true);
  };

  const handleConfirm = async () => {
    const id = row.original.id;
    try {
      await updateFamilia.mutateAsync({
        id: id,
        familia: ["Nenhum", "-"].includes(selectedValue!)
          ? null
          : parseInt(selectedValue!),
      });
      toast({
        title: "Sucesso",
        description: `A família da pessoa foi atualizada com sucesso!`,
        variant: "success",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating familia:", error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar a família da pessoa`,
        variant: "destructive",
      });
    } finally {
      setSelectedValue(defaultValue);
    }
  };

  const handleClose = () => {
    setSelectedValue("Nenhum");
  };

  useEffect(() => {
    const newValue =
      row.getValue("familia") === null
        ? "Nenhum"
        : row.getValue("familia")?.toString();
    setSelectedValue(newValue);
  }, [row.getValue("familia")]);

  const hiddenSelected = [`ladies`, `bone`, `hakuna`, "cartas", "inscritos"];
  const isHidden = hiddenSelected.some((keyword) => pathname.includes(keyword));

  return (
    <>
      <div className="flex items-center justify-center">
        {isHidden ? (
          <div className="flex h-8 w-8 items-center justify-center self-center rounded-md bg-muted/70">
            {row.getValue("familia")?.toString() ?? "-"}
          </div>
        ) : (
          <Select value={selectedValue} onValueChange={handleFamiliaChange}>
            <SelectTrigger size="sm">
              <SelectValue>
                {selectedValue === "Nenhum" ? "-" : selectedValue}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {familiaOptions.map((option) => (
                <SelectItem
                  size="sm"
                  key={option}
                  value={
                    option.toString() === "Nenhum" ? "-" : option.toString()
                  }
                >
                  {option}
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
              Certeza que deseja alterar a família do participante -{" "}
              <b>{row.original.nome}</b>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose onClick={handleClose}>Cancelar</DialogClose>
            <Button loading={updateFamilia.isPending} onClick={handleConfirm}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
