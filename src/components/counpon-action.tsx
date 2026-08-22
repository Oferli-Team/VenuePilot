"use client";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { AlertModal } from "./coupon/alert-modal";
import { toast } from "./ui/use-toast";
import { type CupomDesconto } from "@prisma/client";
import { api } from "@/trpc/react";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";

type CellActionProps = {
  data?: CupomDesconto;
};

export function CouponAction({ data }: CellActionProps) {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({ couponId: data?.id });

  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const { refetch } = api.cupom.getAll.useQuery(undefined, {
    enabled: false,
  });

  const { mutate: deleteCupom, isPending: deleteCupomPending } =
    api.cupom.delete.useMutation({
      onError: async (_) => {
        toast({
          title: "Não foi possível deletar o Cupom",
        });
      },
      onSuccess: async (_) => {
        setAlertModalOpen(false);
        toast({
          title: "Cupom deletado com sucesso!",
        });
        router.refresh();
        await refetch();
      },
    });

  const disabledDeleteIfCouponAlreadyUsed = () => {
    if (data && data?.usadoCount > 0) {
      return true;
    }
    return false;
  };

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
                router.push(orgsRoutes.event.coupons.byId);
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
              disabled={disabledDeleteIfCouponAlreadyUsed()}
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

      {alertModalOpen && (
        <AlertModal
          title="Certeza que deseja excluir?"
          description="Essa ação não pode ser revertida."
          name={data?.codigo}
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          onConfirm={() => deleteCupom(data)}
          loading={deleteCupomPending}
        />
      )}
    </div>
  );
}
