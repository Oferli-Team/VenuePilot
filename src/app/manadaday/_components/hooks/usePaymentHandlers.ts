"use client";

import { useCupomDesconto } from "@/app/_components/coupon/useCupomDesconto";
import { useFormStore } from "@/app/_components/participante/useFormStore";
import { toast } from "@/app/_components/ui/use-toast";
import { creditCardSchemaNew } from "@/app/zod-validation/schemas";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { api } from "@/trpc/react";
import { z } from "zod";

const formDataCreditCardSchema = creditCardSchemaNew.merge(
  z.object({
    registerId: z.string(),
  }),
);

const formDataSchema = z.object({
  id: z.string(),
  cpf: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string(),
});

type FormDataCreditCard = z.infer<typeof formDataCreditCardSchema>;
type FormData = z.infer<typeof formDataSchema>;

type PaymentHandlersProps = {
  setCreditCardCharge: (val: any) => void;
};

export const usePaymentHandlers = ({
  setCreditCardCharge,
}: PaymentHandlersProps) => {
  const {
    discount,
    fee,
    amount,
    setPaymentIsLoading,
    setChargeAlreadyCreatedAsaas,
    setIsPaid,
    resetValues,
    setIsPaymentCardProcessing,
  } = useCalcValueTopStore();
  const { eventRegister } = useFormStore();
  const { setCharge, setOpenChargePixModal } = usePixChargeStore();
  const { cupom } = useCupomDesconto();

  const { mutateAsync: getRecentCustomerPaymentsByReference } =
    api.payments.getRecentCustomerPaymentsByReferenceAsaas.useMutation();

  const { mutateAsync: updateRegisterAlreadyPaid } =
    api.manadaDay.updateRegisterAlreadyPaid.useMutation();

  const { mutateAsync: createCreditCardPaymentAndUpdateRegister } =
    api.manadaDay.createCreditCardPaymentAndUpdateRegister.useMutation();

  const { mutateAsync: createPixCharge } =
    api.manadaDay.createPixCharge.useMutation();

  const { mutateAsync: updateRegisterWithCouponOff } =
    api.manadaDay.updateRegisterWithCouponOff.useMutation();

  const paymentIsConfirmed = (title?: string) => {
    toast({
      title: title ?? "✅ Pagamento Aprovado!",
      description: "Operação realizada com sucesso",
      duration: 3000,
      variant: "success",
    });

    resetValues();
    setIsPaid(true);
  };

  const paymentIsNotConfirmed = (error: unknown) => {
    toast({
      title: `${error ?? "Erro na operação, tente novamente."}`,
      duration: 5000,
      variant: "destructive",
    });
  };

  const eventInfo = {
    id: eventRegister?.id,
    title: eventRegister?.titulo,
    topNumber: eventRegister?.topNumero,
    type: eventRegister?.type,
  };

  const handleCreditCardPayment = async (data: FormDataCreditCard) => {
    const { registerId } = data;
    try {
      const customerInfo = {
        name: data.cc_name,
        cpfCnpj: data.cc_cpfCnpj,
        phone: data.cc_mobilePhone,
        email: data.cc_email,
        postalCode: data.cc_postalCode,
        addressNumber: data.cc_addressNumber,
      };

      const { chargeAlreadyCreated, chargeAlreadyPaid } =
        await getRecentCustomerPaymentsByReference({
          cpfCnpj: customerInfo.cpfCnpj,
          eventId: eventInfo.id!,
          registerId,
        });

      if (chargeAlreadyCreated && chargeAlreadyPaid) {
        await updateRegisterAlreadyPaid({
          confirmedPayment: chargeAlreadyCreated,
          eventInfo,
          eventValue: amount,
          registerId,
        });
        paymentIsConfirmed();
        return;
      }

      if (chargeAlreadyCreated) {
        setChargeAlreadyCreatedAsaas(chargeAlreadyCreated);
        return;
      }

      setIsPaymentCardProcessing(true);

      const [installment, valuePerInstallment] =
        data.cc_installment?.split(" - ") ?? [];
      const [expiryMonth = "", expiryYear = ""] =
        data.cc_expiry.split("/") ?? [];

      const cardInfo = {
        holderName: data.cc_holderName,
        number: data.cc_number,
        expiryMonth,
        expiryYear,
        ccv: data.cc_cvc,
      };

      const { payment, error } = await createCreditCardPaymentAndUpdateRegister(
        {
          eventInfo,
          registerId,
          customerInfo,
          cardInfo,
          paymentAmounts: {
            totalValue: amount,
            discount,
            fee,
            installment: Number(installment),
            valuePerInstallment: Number(valuePerInstallment),
            eventValue: 0,
          },
          coupon: cupom ? { id: cupom.id, code: cupom.codigo } : undefined,
        },
      );

      if (!payment && error) throw new Error(error);

      if (payment?.status === "CONFIRMED") {
        setCreditCardCharge(payment);
      }
    } catch (error) {
      paymentIsNotConfirmed(error);
      setPaymentIsLoading(false);
      setIsPaymentCardProcessing(false);
    } finally {
      setPaymentIsLoading(false);
    }
  };

  const handlePixPayment = async (data: FormData) => {
    try {
      const charge = await createPixCharge({
        customerInfo: {
          ...data,
          cpfCnpj: data.cpf,
        },
        eventInfo,
        paymentAmounts: {
          totalValue: amount,
          fee,
          discount,
        },
        registerId: data.id,
        cpf: data.cpf,
        coupon: cupom ? { id: cupom.id, code: cupom.codigo } : undefined,
      });

      setCharge(charge);
      setOpenChargePixModal(true);
    } catch (error) {
      paymentIsNotConfirmed(error);
    } finally {
      setPaymentIsLoading(false);
    }
  };

  const handleFreePayment = async ({ registerId }: { registerId: string }) => {
    try {
      if (!cupom) {
        throw new Error("Ops, não encontramos o cupom, tente novamente");
      }

      const register = await updateRegisterWithCouponOff({
        eventId: eventInfo.id!,
        registerId,
        paymentAmounts: {
          discount,
          fee,
          totalValue: amount,
        },
        coupon: { id: cupom.id },
      });

      paymentIsConfirmed("✅ Tudo Certo!");

      setTimeout(() => {
        window.location.assign(`/manadaday/ticket/${register.identifier}`);
      }, 1000);
    } catch (error) {
      paymentIsNotConfirmed(error);
    } finally {
      setPaymentIsLoading(false);
    }
  };

  return {
    handleCreditCardPayment,
    handlePixPayment,
    paymentIsConfirmed,
    paymentIsNotConfirmed,
    handleFreePayment,
  };
};
