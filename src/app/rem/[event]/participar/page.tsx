"use client";

import React from "react";
import { useFormStore } from "@/components/participante/useFormStore";
import { PaymentMethods } from "@/components/payment-methods";
import { FormProvider, useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRemParticipantSchema,
  creditCardSchemaNew,
} from "@/app/zod-validation/schemas";
import { FormParticipantRem } from "@/components/event/REM/form-participant";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { CupomDesconto } from "@/components/coupon/cupom-desconto";
import { validateCreditCard } from "@/app/zod-validation/validation";
import { useCupomDesconto } from "@/components/coupon/useCupomDesconto";
import { api } from "@/trpc/react";
import { PixChargeAsaasModal } from "@/components/asaas-pix/pix-charge-asaas-modal";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { usePaymentMonitor } from "@/lib/hooks/usePaymentMonitor";
import { type AsaasPaymentResponse } from "@/appTypes/asaas";
import { AlertPaymentConfirmedModal } from "@/components/alert-payment-confimed-modal";
import { usePaymentHandlers } from "@/lib/hooks/usePaymentHandlers";
import { toast } from "@/components/ui/use-toast";
import { MethodPaymentCheckbox } from "@/components/method-payment-checkbox";
import { FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE } from "@/lib/constants";

const registerSchema = createRemParticipantSchema;
const payByCreditCardSchema = registerSchema.merge(creditCardSchemaNew).refine(
  (data) => {
    const errors = validateCreditCard(data);
    return errors.length === 0;
  },
  {
    message: "Dados do cartão inválidos",
    path: ["cc_installment"],
  },
);

type Method = "pix" | "creditCard" | "free";

type FormData = z.infer<typeof registerSchema>;
type CreditCardFormData = z.infer<typeof payByCreditCardSchema>;

export default function RegisterREMPage() {
  const { formData, eventRegister, setFormData, secretLink } = useFormStore();
  const { cupom } = useCupomDesconto();
  const { setCharge, charge } = usePixChargeStore();
  const {
    setTopValue,
    topValue,
    setIsPaid,
    amount,
    setPaymentIsLoading,
    setIsPaymentCardProcessing,
    method,
    setMethod,
  } = useCalcValueTopStore();

  const [creditCardCharge, setCreditCardCharge] =
    React.useState<AsaasPaymentResponse | null>(null);

  const {
    handleCreditCardPayment,
    handleFreePayment,
    handlePixPayment,
    paymentIsConfirmed,
  } = usePaymentHandlers({
    setCreditCardCharge,
  });

  const { mutateAsync: createRegister } =
    api.inscricao.createRemParticipantRegister.useMutation();

  usePaymentMonitor({
    method: "PIX",
    registerId: formData?.id,
    eventoId: eventRegister?.id,
    enabled: !!formData.id && method === "pix" && !!charge,
    refetchInterval: 15 * 1000, // 15 seconds
    onSuccess: () => {
      setIsPaid(true);
      setCharge(null);
      paymentIsConfirmed();
    },
  });

  usePaymentMonitor({
    method: "CREDIT_CARD",
    registerId: formData?.id,
    eventoId: eventRegister?.id,
    enabled: !!formData.id && method === "creditCard" && !!creditCardCharge,
    refetchInterval: 10 * 1000, // 10 seconds
    onSuccess: () => {
      setIsPaid(true);
      setCreditCardCharge(null);
      paymentIsConfirmed();
      setIsPaymentCardProcessing(false);
    },
  });

  const schema = React.useMemo(() => {
    return method === "pix" || method === "free"
      ? registerSchema
      : payByCreditCardSchema;
  }, [method]);

  const createForm = useForm<FormData | CreditCardFormData>({
    resolver: zodResolver(schema),
  });

  const {
    handleSubmit,
    resetField,
    formState: { errors },
  } = createForm;

  const onSubmit = async (data: FormData | CreditCardFormData) => {
    if (!eventRegister) {
      toast({
        title: "Erro ao atualizar inscrição, evento não encontrado",
        variant: "destructive",
      });
      return;
    }

    setPaymentIsLoading(true);

    try {
      let registerId = null;

      if (formData.id) {
        registerId = formData.id;
      } else {
        const { id } = await createRegister({
          ...data,
          dataNascimento: data.data_nascimento,
          eventId: eventRegister?.id,
          igrejaPastor: data.igreja_pastor,
          ruaNumero: data.rua_numero,
          celularContatoEmergencia: data.celular_contato_emergencia,
          tipoVinculoContatoEmergencia: data.tipo_vinculo_contato_emergencia,
          nomeContatoEmergencia: data.nome_contato_emergencia,
          secretLink,
        });
        registerId = id;
      }

      setFormData({ id: registerId });

      if (registerId) {
        if (isCreditCardData(data, method))
          await handleCreditCardPayment({
            ...data,
            registerId,
            registerType: "PARTICIPANTE",
          });

        if (isPixData(data, method))
          await handlePixPayment({
            ...data,
            id: registerId,
            registerType: "PARTICIPANTE",
          });

        if (isFreeData(data, method)) await handleFreePayment({ registerId });
        return;
      }

      toast({
        title: "Não foi finalizar inscrição, tente novamente",
        variant: "destructive",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Não foi finalizar inscrição, tente novamente",
        variant: "destructive",
      });
    } finally {
      setPaymentIsLoading(false);
    }
  };
  const isCreditCardData = (
    data: any,
    method: Method,
  ): data is CreditCardFormData => {
    return method === "creditCard";
  };

  const isFreeData = (data: any, method: Method): data is FormData => {
    return method === "free";
  };

  const isPixData = (data: any, method: Method): data is FormData => {
    return method === "pix";
  };

  React.useEffect(() => {
    if (eventRegister) {
      setTopValue(eventRegister.valorParticipante);
    }
  }, [eventRegister, setTopValue]);

  React.useEffect(() => {
    resetField("cc_installment");
  }, [topValue, cupom, resetField]);

  React.useEffect(() => {
    // cupom.desconto === 10000 = 100% de desconto
    if (cupom && cupom?.desconto === 10000 && amount === 0) {
      setMethod("free");
    }
  }, [amount, cupom]);

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormParticipantRem />

        <GridTwoColumns
          title="Cupom de Desconto"
          className="rounded-md border bg-card p-4 md:grid-cols-1"
        >
          <CupomDesconto />
        </GridTwoColumns>

        <MethodPaymentCheckbox
          showCreditCard={FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE}
        />

        <PaymentMethods />
        <PixChargeAsaasModal />
        <AlertPaymentConfirmedModal />
      </form>
    </FormProvider>
  );
}
