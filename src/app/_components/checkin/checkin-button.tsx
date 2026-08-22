import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { Square, SquareCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { isCheckIn } from "@/lib/utils/hasRole";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentMembership } from "@/lib/hooks/member";

type CheckinButtonProps = {
  readonly id: string;
  readonly initialCheckinStatus: boolean;
};

export function CheckinButton({
  id,
  initialCheckinStatus,
}: CheckinButtonProps) {
  const { membership } = getCurrentMembership();

  const { event } = useEventStore();
  const { invalidateCheckIn } = useInvalidateQueries();

  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckinStatus);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirmCheckinDialog, setShowConfirmCheckinDialog] =
    useState(false);

  const updateCheckin = api.inscricao.updateCheckin.useMutation({
    async onSuccess() {
      await invalidateCheckIn();
    },
  });

  const handleCheckinToggle = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (isCheckedIn) {
      setShowConfirmDialog(true);
    } else {
      setShowConfirmCheckinDialog(true);
    }
  };

  const performCheckinUpdate = async () => {
    try {
      if (!event?.id) return;

      await updateCheckin.mutateAsync({
        eventoId: event.id,
        id: id,
        checkin: !isCheckedIn,
      });
      toast({
        title: "Sucesso",
        variant: "success",
        description: isCheckedIn
          ? "Check-out realizado com sucesso!"
          : "Check-in realizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar check-in:", error);
      toast({
        title: "Erro",
        description: `Não foi possível realizar o ${isCheckedIn ? "check-out" : "check-in"}`,
        variant: "destructive",
      });
    } finally {
      setShowConfirmDialog(false);
      setShowConfirmCheckinDialog(false);
    }
  };

  const hasPermission = isCheckIn(membership);

  useEffect(() => {
    setIsCheckedIn(initialCheckinStatus);
  }, [initialCheckinStatus]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={handleCheckinToggle}
                variant="ghost"
                className="h-8 w-8 p-0 transition-all duration-150"
                disabled={!hasPermission}
              >
                <SquareCheck
                  size={20}
                  className={`transform text-success transition-all duration-150 ${isCheckedIn ? "scale-100" : "h-0 w-0 scale-0"}`}
                />

                <Square
                  size={20}
                  className={`transform text-destructive transition-all duration-150 ${!isCheckedIn ? "scale-100" : "h-0 w-0 scale-0"}`}
                />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isCheckedIn
              ? "Desfazer check-in / Fazer check-out"
              : "Fazer check-in"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={showConfirmCheckinDialog}
        onOpenChange={setShowConfirmCheckinDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Deseja realizar check-in do pariticante?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button
              loading={updateCheckin.isPending}
              variant="default"
              onClick={performCheckinUpdate}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Certeza que deseja desfazer o check-in?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button
              loading={updateCheckin.isPending}
              variant="default"
              onClick={performCheckinUpdate}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
