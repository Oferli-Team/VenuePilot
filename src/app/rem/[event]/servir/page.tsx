"use client";

import { AlertPaymentConfirmedModal } from "@/components/alert-payment-confimed-modal";
import { PixChargeAsaasModal } from "@/components/asaas-pix/pix-charge-asaas-modal";
import { CupomDesconto } from "@/components/coupon/cupom-desconto";
import { useCupomDesconto } from "@/components/coupon/useCupomDesconto";
import { FormServeRem } from "@/components/event/REM/form-serve";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { MethodPaymentCheckbox } from "@/components/method-payment-checkbox";
import { useFormStore } from "@/components/participante/useFormStore";
import { PaymentMethods } from "@/components/payment-methods";
import { toast } from "@/components/ui/use-toast";
import {
  createRemServeSchema,
  creditCardSchemaNew,
} from "@/app/zod-validation/schemas";
import { validateCreditCard } from "@/app/zod-validation/validation";
import type { AsaasPaymentResponse } from "@/appTypes/asaas";
import { FEATURE_FLAG_SHOW_CREDITCARD_OPTION_SERVIR } from "@/lib/constants";
import { usePaymentHandlers } from "@/lib/hooks/usePaymentHandlers";
import { usePaymentMonitor } from "@/lib/hooks/usePaymentMonitor";
import { useResetDiscountValues } from "@/lib/hooks/useResetDiscountValues";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const payByCreditCardSchema = createRemServeSchema
  .merge(creditCardSchemaNew)
  .superRefine((data, ctx) => {
    const errors = validateCreditCard(data);
    if (errors.length > 0) {
      ctx.addIssue({
        path: ["cc_installment"],
        message: "Dados do cartão inválidos",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type Method = "pix" | "creditCard" | "free";

export type FormData = z.infer<typeof createRemServeSchema>;
export type CreditCardFormData = z.infer<typeof payByCreditCardSchema>;

export default function RegisterServePage() {
  const { mutateAsync: createRegister } =
    api.inscricao.createRemServeRegister.useMutation();

  const [creditCardCharge, setCreditCardCharge] =
    React.useState<AsaasPaymentResponse | null>(null);

  const { formData, setFormData, eventRegister, secretLink } = useFormStore();
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

  const { resetValues } = useResetDiscountValues();

  const {
    handleCreditCardPayment,
    handleFreePayment,
    handlePixPayment,
    paymentIsConfirmed,
  } = usePaymentHandlers({
    setCreditCardCharge,
  });

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
      ? createRemServeSchema
      : payByCreditCardSchema;
  }, [method]);

  const createForm = useForm<FormData | CreditCardFormData>({
    resolver: zodResolver(schema),
  });

  const { handleSubmit, resetField, watch } = createForm;

  const onSubmit = async (data: FormData | CreditCardFormData) => {
    if (!eventRegister) {
      toast({
        title: "Erro ao atualizar inscrição, evento não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (
      data.lgndCertificado === undefined ||
      (!data.lgndCertificado && !data.manTshirtSize) ||
      (!data.lgndCertificado && !data.womanTshirtSize)
    ) {
      toast({
        title: "Opção de camisetas precisa ser preenchida",
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
          ruaNumero: data.rua_numero,
          igrejaPastor: data.igreja_pastor,
          lgndCertificado: data.lgndCertificado,
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
            registerType: "SERVIR",
          });

        if (isPixData(data, method))
          await handlePixPayment({
            ...data,
            id: registerId,
            registerType: "SERVIR",
          });

        if (isFreeData(data, method)) await handleFreePayment({ registerId });
        return;
      }

      toast({
        title: "Não foi finalizar inscrição, tente novamente",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Não foi finalizar inscrição, tente novamente",
        variant: "destructive",
      });
      console.log(error);
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

  const lgndCertificate = watch("lgndCertificado") as string;

  React.useEffect(() => {
    if (!eventRegister) return;
    if (lgndCertificate === "false") {
      setTopValue(eventRegister.valorParaObterCertificacao);
      resetValues();
    } else {
      setTopValue(eventRegister.valorParaLgndCertificados);
      resetValues();
    }
  }, [eventRegister, setTopValue, lgndCertificate]);

  React.useEffect(() => {
    resetField("cc_installment");
  }, [topValue, cupom, resetField]);

  React.useEffect(() => {
    // cupom.desconto === 10000 = 100% de desconto
    if (cupom && cupom.desconto === 10000 && amount === 0) {
      setMethod("free");
    }
  }, [amount, cupom]);

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormServeRem />

        <GridTwoColumns
          title="Cupom de Desconto"
          className={`rounded-md border bg-card p-4 md:grid-cols-1 ${lgndCertificate === undefined ? "hidden" : "grid"}`}
        >
          <CupomDesconto />
        </GridTwoColumns>

        <MethodPaymentCheckbox
          showCreditCard={FEATURE_FLAG_SHOW_CREDITCARD_OPTION_SERVIR}
        />

        <PaymentMethods />
        <PixChargeAsaasModal />
        <AlertPaymentConfirmedModal />
      </form>
    </FormProvider>
  );
}
