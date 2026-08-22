"use client";

import type { Vehicle } from "@prisma/client";
import { type Row } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";

export const ActiveVehicle = ({ row }: { row: Row<Vehicle> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<boolean>(row.getValue("active"));

  const { invalidateVehicles } = useInvalidateQueries();

  const { data: hasRegisterWithVehicleId } =
    api.inscricao.getRegisterWithVehicleId.useQuery(
      {
        vehicleId: row.original.id,
      },
      { enabled: !!row.original.id },
    );

  const { mutate: updatedVehicleActiveStats, isPending } =
    api.vehicle.updateActive.useMutation({
      onSuccess: async (data) => {
        try {
          setActive(data.active);
          setIsOpen(false);
          await invalidateVehicles();
        } catch (error) {
          toast({
            title: "Ops, erro na operação",
            variant: "destructive",
          });
          console.error("Erro ao atualizar a viatura", error);
        }
      },
    });

  const handleUpdate = (active: boolean) => {
    updatedVehicleActiveStats({
      id: row.original.id,
      eventId: row.original.eventId,
      active,
    });
  };

  const handleCheckedChange = () => {
    const activeUpdated = !active;

    if (hasRegisterWithVehicleId && active) {
      setIsOpen(true);
      return;
    }
    setActive(activeUpdated);
    handleUpdate(activeUpdated);
  };

  return (
    <>
      <div className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Switch
                  onCheckedChange={handleCheckedChange}
                  checked={active}
                  disabled={isPending}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{active ? "Desativar" : "Ativar"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader className="space-y-2">
            <DialogTitle>Tem certeza?</DialogTitle>
            <DialogDescription className="text-foreground/90">
              <b className="text-primary">ATENÇÃO!</b>
              <br />
              Existem Legendários ou Senderistas atribuídos à{" "}
              <b className="text-foreground">{row.original.name}</b>. Ao
              desativá-la, esses homens serão removidos da viatura.
              <br /> Deseja realmente continuar?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button loading={isPending} onClick={() => handleUpdate(!active)}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
