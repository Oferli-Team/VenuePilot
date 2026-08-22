import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";

type AlertPaymentConfirmedModalProps = {
  description?: string;
};

export const AlertPaymentConfirmedModal = ({
  description,
}: AlertPaymentConfirmedModalProps) => {
  const { isPaid, setIsPaid } = useCalcValueTopStore();
  return (
    <Dialog
      open={isPaid}
      onOpenChange={(open) => {
        if (isPaid) return;
        setIsPaid(open);
      }}
    >
      <DialogTrigger></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="size-4 text-success" /> Inscrição confirmada
          </DialogTitle>
          <DialogDescription>
            {!description && "🎉 Seu pagamento foi realizado com sucesso! 🎉"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex  items-center gap-2">
          <Spinner />
          <p className="font-semibold">
            Aguarde, estamos preparando seu Ticket...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
