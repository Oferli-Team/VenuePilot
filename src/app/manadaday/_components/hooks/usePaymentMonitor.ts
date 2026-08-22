import { toast } from "@/app/_components/ui/use-toast";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { api } from "@/trpc/react";
import { type ManadaDayRegister } from "@prisma/client";
import { useEffect } from "react";

type PaymentMonitorProps = {
  method?: "CREDIT_CARD" | "PIX";
  registerId: string;
  eventoId: string;
  enabled: boolean;
  refetchInterval?: number;
  onSuccess?: VoidFunction;
};

export const usePaymentMonitor = ({
  method = "PIX",
  registerId,
  eventoId,
  enabled,
  refetchInterval = 15_000,
  onSuccess,
}: PaymentMonitorProps) => {
  const { data: register } = api.manadaDay.getRegisterById.useQuery(
    {
      id: registerId,
      eventoId,
    },
    {
      enabled,
      refetchInterval,
    },
  );

  const handleDefaultCallback = (register: ManadaDayRegister) => {
    toast({
      title: "Pagamento confirmado!",
      description: "Sua inscrição foi realizada com sucesso",
      variant: "success",
    });

    setTimeout(() => {
      window.location.assign(`/manadaday/ticket/${register.identifier}`);
    }, 1_000);
  };

  useEffect(() => {
    if (!register) return;

    let isPaymentCompleted = false;

    if (method === "PIX") {
      isPaymentCompleted =
        register.paymentStatus === ENUM_PAYMENT_STATUS.CHARGE_COMPLETED &&
        register.status === ENUM_STATUS.CONFIRMADA;
    } else if (method === "CREDIT_CARD") {
      isPaymentCompleted =
        register.paymentStatus ===
          ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED &&
        register.status === ENUM_STATUS.CONFIRMADA;
    }

    if (isPaymentCompleted) {
      handleDefaultCallback(register);
      onSuccess?.();
    }
  }, [register, method]);
};
