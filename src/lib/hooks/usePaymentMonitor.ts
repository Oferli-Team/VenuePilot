import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { type Inscricao } from "@prisma/client";
import { useEffect } from "react";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "../enum";

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
  // TODO: we need a query that get only few fields like status and payment_status, cpf, eventoId
  const { data: inscricaoData } = api.inscricao.getRegisterById.useQuery(
    {
      id: registerId,
      eventoId,
    },
    {
      enabled,
      refetchInterval,
    },
  );

  const handleDefaultCallback = (inscricao: Inscricao) => {
    toast({
      title: "Pagamento confirmado!",
      description: "Sua inscrição foi realizada com sucesso",
      variant: "success",
    });

    setTimeout(() => {
      window.location.assign(`/ticket/${inscricao.eventoId}/${inscricao.cpf}`);
    }, 1_000);
  };

  useEffect(() => {
    if (!inscricaoData) return;

    let isPaymentCompleted = false;

    if (method === "PIX") {
      isPaymentCompleted =
        inscricaoData.pagamento_status ===
          ENUM_PAYMENT_STATUS.CHARGE_COMPLETED &&
        inscricaoData.status === ENUM_STATUS.CONFIRMADA;
    } else if (method === "CREDIT_CARD") {
      isPaymentCompleted =
        inscricaoData.pagamento_status ===
          ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED &&
        inscricaoData.status === ENUM_STATUS.CONFIRMADA;
    }

    if (isPaymentCompleted) {
      handleDefaultCallback(inscricaoData);
      onSuccess?.();
    }
  }, [inscricaoData]);
};
