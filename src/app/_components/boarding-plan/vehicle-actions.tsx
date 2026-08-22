"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import { type Vehicle } from "@prisma/client";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type CellActionProps = {
  readonly data?: Vehicle;
};

export function VehicleActions({ data }: CellActionProps) {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({});
  const { invalidateVehicles } = useInvalidateQueries();

  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const { data: hasRegisterWithVehicleId } =
    api.inscricao.getRegisterWithVehicleId.useQuery(
      {
        vehicleId: data?.id,
      },
      { enabled: alertModalOpen && !!data?.id },
    );

  const { mutate: deleteVehicle, isPending: deleteVehiclePending } =
    api.vehicle.delete.useMutation({
      onError: async (_) => {
        toast({
          title: "Não foi possível excluir a viatura",
          variant: "destructive",
        });
      },
      onSuccess: async (_) => {
        setAlertModalOpen(false);
        toast({
          title: "Viatura excluída com sucesso",
          variant: "success",
        });
        await invalidateVehicles();
      },
    });

  return (
    <div className="flex justify-end space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => {
                router.push(
                  `${orgsRoutes.event.boardingPlan.createVehicle}/${data?.id}`,
                );
              }}
            >
              <Pencil className="h-4 w-4 text-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => {
                setAlertModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deletar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={alertModalOpen} onOpenChange={setAlertModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Esta é uma ação irreversível
            </p>
            {hasRegisterWithVehicleId ? (
              <DialogDescription className="text-foreground/90">
                <b className="text-primary">ATENÇÃO!</b>
                <br />
                Existem Legendários ou Senderistas atribuídos à{" "}
                <b className="text-foreground">{data?.name}</b>. Ao excluir,
                esses homens serão removidos da viatura.
                <br /> Deseja realmente excluir?
              </DialogDescription>
            ) : (
              <DialogDescription className="text-foreground/90">
                Certeza que deseja deletar a viatura{" "}
                <b className="text-foreground">{data?.name}</b> ?
              </DialogDescription>
            )}
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={deleteVehiclePending}
              onClick={() =>
                deleteVehicle({ eventId: data?.eventId, id: data?.id })
              }
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
