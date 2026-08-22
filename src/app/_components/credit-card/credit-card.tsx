"use client";
import "react-credit-cards/es/styles-compiled.css";

import { creditCardSchema } from "@/app/zod-validation/schemas";
import {
  type ChargeAsaasType,
  type AsaasCreditCardPaymentRequest,
  type AsaasCustomerRequest,
} from "@/appTypes/asaas";
import {
  createCustomer,
  createPayment,
  getCustomerByCpf,
  getCustomerChargesAtAsaas,
} from "@/lib/actions/asaas";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { type Loading } from "@/lib/types";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import cardValidator from "card-validator";
import { addDays, format, parse } from "date-fns";
import { Check, ChevronDown, Ticket } from "lucide-react";
import React, { type ChangeEvent, useEffect, useState } from "react";
import Cards from "react-credit-cards";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { mask } from "remask";
import { type z } from "zod";
import Fieldset from "../Fiedset";
import { PaymentDetail } from "../payment-detail";
import { useFormStore } from "../participante/useFormStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { toast } from "../ui/use-toast";
import { getInscricaoByCPF } from "@/lib/queries/client";
import { useCupomDesconto } from "../coupon/useCupomDesconto";
import Link from "next/link";
import { InstallmentSelect } from "./installment-select";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import { generateExpiryOptions } from "@/lib/utils/generateExpiryDateOptions";
import { cleanData } from "@/lib/utils/clean-mask";
import { ToastAction } from "../ui/toast";
import { InputPhone } from "../ui/input-phone";
import {
  ENUM_CHECKIN_STATUS,
  ENUM_PAYMENT_STATUS,
  ENUM_STATUS,
} from "@/lib/enum";
import { generateCheckInCode } from "@/lib/utils/generateCheckInCode";

type CreditCardProps = {
  participanteIsPayer?: boolean;
};

type FormData = z.infer<typeof creditCardSchema>;

export const CreditCard = ({ participanteIsPayer }: CreditCardProps) => {
  const { amount, discount, fee, resetValues, setIsPaid, topValue, isPaid } =
    useCalcValueTopStore();
  const { cupom, cupomValue, resetCupom } = useCupomDesconto();

  // Hook do Zustand
  const { formData, eventRegister } = useFormStore();
  const usarCupom = api.cupom.usarCupom.useMutation();

  const inititalData = {
    cvc: "",
    expiry: "",
    focus: "",
    holderName: "",
    number: "",
    installment: "",
  };

  const inputResetValues = {
    holderName: "",
    number: "",
    cvc: "",
    expiry: "",
    installment: "",
  };

  const [loading, setLoading] = React.useState<Loading>("initial");
  const [cardMask, setCardMask] = React.useState("9999 9999 9999 9999");
  const [cvcMask, setCvcMask] = React.useState("999");
  const [cardMaxLength, setCardMaxLength] = React.useState(16);
  const [data, setData] = React.useState(inititalData);
  const [open, setOpen] = React.useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentCreated, setPaymentCreated] = useState<ChargeAsaasType | null>(
    null,
  );

  const updateInscricao = api.inscricao.updateInscricao.useMutation();

  const createForm = useForm<FormData>({
    resolver: zodResolver(creditCardSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    resetField,
    setFocus,
  } = createForm;

  const setFieldFormWithInscricao = React.useCallback(async () => {
    const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);
    if (!data) return;

    const resetData = participanteIsPayer
      ? {
          name: data.nome?.trim() ?? "",
          holderName: "",
          cpfCnpj: data.cpf ? mask(data.cpf, "999.999.999-99") : "",
          email: data.email ?? "",
          mobilePhone: data.celular ?? "",
          postalCode: data.cep ? mask(data.cep, "99.999-999") : "",
          addressNumber: data.ruaNumero ?? "",
        }
      : {
          name: "",
          holderName: "",
          cpfCnpj: "",
          email: "",
          mobilePhone: "",
          postalCode: "",
          addressNumber: "",
        };

    reset(resetData);
  }, [participanteIsPayer]);

  useEffect(() => {
    void setFieldFormWithInscricao();
  }, [participanteIsPayer]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setData((prevState) => ({ ...prevState, focus: e.target.name }));
  };

  const maskWithSixteen = "9999 9999 9999 9999";
  const maskWithFivetenn = "9999 999999 99999";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((prevState) => ({ ...prevState, [name]: value }));

    if (data.number) return;
    const { card } = cardValidator.number(value);

    if (card) {
      switch (card.type) {
        case "visa":
        case "mastercard":
        case "cielo":
        case "hipercard":
          setCardMask(maskWithSixteen);
          setCardMaxLength(16);
          setCvcMask("999");
          break;
        case "diners-club":
          setCardMask(maskWithFivetenn);
          setCardMaxLength(15);
          setCvcMask("999");
          break;
        case "american-express":
          setCardMask(maskWithFivetenn);
          setCardMaxLength(15);
          setCvcMask("9999");
          break;
        default:
          setCardMask(maskWithSixteen);
          setCardMaxLength(16);
          setCvcMask("999");
      }
    }
  };

  const handleCardNumberChange = ({ issuer }, isValid: boolean) => {
    if (isValid) {
      switch (issuer) {
        case "visa":
        case "mastercard":
        case "cielo":
        case "hipercard":
          setCardMask(maskWithSixteen);
          setCardMaxLength(16);
          setCvcMask("999");
          break;
        case "dinersclub":
          setCardMask(maskWithFivetenn);
          setCardMaxLength(15);
          setCvcMask("999");
          break;
        case "amex":
          setCardMask(maskWithFivetenn);
          setCardMaxLength(15);
          setCvcMask("9999");
          break;
        default:
          setCardMask(maskWithSixteen);
          setCardMaxLength(16);
          setCvcMask("999");
      }
    }
  };

  const expiryOptions = generateExpiryOptions();

  const getRecentCustomerPaymentsByReference = async (customerId: string) => {
    try {
      const externalReference = {
        inscricaoId: formData.id,
        eventoId: eventRegister?.id,
      };

      const JSONFormat = JSON.stringify(externalReference);

      const allPaymentsCreatedFromTheCustomer = await getCustomerChargesAtAsaas(
        customerId,
        JSONFormat,
      );

      return allPaymentsCreatedFromTheCustomer;
    } catch (error) {
      console.log({ error });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (loading === "loading") return;

    if (!eventRegister) {
      toast({
        title: "Ops, não encontramos o evento",
        action: (
          <ToastAction altText="Tente novamente">
            <Link href="/">Tente novamente</Link>
          </ToastAction>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true); // Desabilita o botão

    const {
      holderName: name,
      number: cardNumber,
      cvc: ccv,
      expiry,
      name: namePayer,
      email,
      cpfCnpj: cpfCnpjMask,
      mobilePhone: phone,
      installment: installmentAndValue,
      postalCode: cep,
      addressNumber,
    } = data;

    const holderName = name.toLowerCase().trim();
    const number = cleanData(cardNumber);
    const cpfCnpj = cleanData(cpfCnpjMask);
    const mobilePhone = cleanData(phone);
    const postalCode = cleanData(cep);

    const [installment, valuePerInstallment, totalValue] =
      installmentAndValue.split(" - ");

    const [expiryMonth = "", expiryYear = ""] = expiry.split("/") ?? [];

    const dueDate = format(addDays(new Date(), 3), "yyyy-MM-dd");

    const customerInfo: AsaasCustomerRequest = {
      name: namePayer.trim() ?? "",
      cpfCnpj,
      email: email.trim() ?? "",
      phone: mobilePhone,
      postalCode,
      addressNumber,
      notificationDisabled: true,
    };

    const cardInfo = {
      holderName,
      number,
      expiryMonth,
      expiryYear,
      ccv,
    };

    const paymentInfo: AsaasCreditCardPaymentRequest = {
      billingType: "CREDIT_CARD",
      totalValue: amount,
      dueDate,
      installmentCount: Number(installment),
      creditCard: {
        ...cardInfo,
      },
      creditCardHolderInfo: { ...customerInfo },
      description: `${eventRegister.titulo}-${eventRegister.topNumero}`,
      externalReference: JSON.stringify({
        inscricaoId: formData.id,
        eventoId: eventRegister.id,
      }),
    };

    try {
      setLoading("loading");
      toast({
        title: "Verificando dados...",
        duration: 3000,
      });

      // Attempt to find the customer by CPF
      let customer = await getCustomerByCpf(customerInfo.cpfCnpj);

      // If the customer does not exist, create a new one
      if (!customer) {
        customer = await createCustomer(customerInfo);
      }

      const recentPaymentsByCustomer =
        await getRecentCustomerPaymentsByReference(customer?.id);

      // avoid duplicate payment
      const chargeAlreadyCreated = recentPaymentsByCustomer?.find((payment) => {
        const chargeNotPaid =
          payment.status === "CREATED" || payment.status === "PENDING";
        const billingTypeCreditCard = payment.billingType === "CREDIT_CARD";
        return billingTypeCreditCard && chargeNotPaid;
      });

      if (chargeAlreadyCreated) {
        setPaymentCreated(chargeAlreadyCreated);
        return;
      }

      const confirmedPayment = recentPaymentsByCustomer?.find((payment) => {
        return payment.status === "CONFIRMED";
      });

      if (confirmedPayment) {
        setPaymentCreated(null);

        const totalValuePaid =
          confirmedPayment.installmentNumber * confirmedPayment.value;

        const checkinCode = generateCheckInCode();

        await updateInscricao.mutateAsync({
          id: formData.id!,
          eventoId: eventRegister.id,
          status: ENUM_STATUS.CONFIRMADA,
          pagamento_status: ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED,
          pagamento_data: parse(
            confirmedPayment.dateCreated,
            "yyyy-MM-dd",
            new Date(),
          ),
          metodo_pagamento: "CARTAO",
          pagamento_integracao_service: "ASAAS",
          pagamento_integracao_status: confirmedPayment.status,
          pagamento_value_per_installment: convertToBasisPoint(
            confirmedPayment.value,
          ),
          pagamento_top_value: convertToBasisPoint(topValue),
          pagamento_discount_value: convertToBasisPoint(
            confirmedPayment.discount.value,
          ),
          pagamento_installment: confirmedPayment.installmentNumber,
          pagamento_total_value: convertToBasisPoint(totalValuePaid),
          pagamento_link_url: confirmedPayment.invoiceUrl,
          pagamento_charge_id: confirmedPayment.installment,
          checkinCode,
        });

        toast({
          title: "Pagamento já realizado",
          description: "Encontramos um pagamento confirmado para este cliente.",
          variant: "success",
        });

        setIsPaid(true);
        return;
      }

      if (customer.errors) {
        throw new Error(customer.errors[0].description);
      }

      await updateInscricao.mutateAsync({
        id: formData.id!,
        eventoId: eventRegister.id,
        status: ENUM_STATUS.AGUARDANDO_PAGAMENTO,
        pagamento_status: ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_PENDENTE,
        pagamento_couponValue: cupomValue ?? "0",
        metodo_pagamento: "CARTAO",
        pagamento_integracao_service: "ASAAS",
        pagamento_installment: Number(installment),
        pagamento_value_per_installment: Number(valuePerInstallment),
        pagamento_total_value: Number(totalValue),
        pagamento_fee_card: convertToBasisPoint(fee),
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
      });

      // Proceed to create a payment using the customer's ID
      const payment = await createPayment(paymentInfo, customer.id);

      if (payment.errors) {
        throw new Error(payment.errors[0].description);
      }

      // Status da cobrança
      // PENDING RECEIVED CONFIRMED OVERDUE REFUNDED RECEIVED_IN_CASH REFUND_REQUESTED REFUND_IN_PROGRESS CHARGEBACK_REQUESTED CHARGEBACK_DISPUTE AWAITING_CHARGEBACK_REVERSAL DUNNING_REQUESTED DUNNING_RECEIVED AWAITING_RISK_ANALYSIS

      if (payment.status === "CONFIRMED") {
        await getInscricaoByCPF(formData.cpf, eventRegister.id);

        if (cupom) {
          await usarCupom.mutateAsync({
            eventoId: eventRegister.id,
            id: cupom.id,
            inscricaoId: formData.id!,
            usadoCount: cupom.usadoCount + 1,
          });
        }

        toast({
          title: "✅ Pagamento Aprovado!",
          description: "Sua inscrição foi realizada com sucesso",
          duration: 3000,
          variant: "success",
        });

        setIsPaid(true);
      }

      setData(inititalData);
      reset(inputResetValues);
      resetValues();
      resetCupom();
    } catch (error) {
      setLoading("initial");
      toast({
        title: `✖️ ${error?.message ?? "Erro na operação, tente novamente."}`,
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setLoading("initial");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (errors.name && !open) setOpen(true);
    setFocus("name");
  }, [errors.name]);

  useEffect(() => {
    if (!isPaid) return;

    const checkStatus = () => {
      void (async () => {
        try {
          const register = await getInscricaoByCPF(
            formData.cpf,
            eventRegister?.id ?? "",
          );

          if (register?.status === ENUM_STATUS.CONFIRMADA) {
            clearInterval(intervalId);
            window.location.assign(
              `/ticket/${register.eventoId}/${register.cpf}`,
            );
          }
        } catch (error) {
          console.error("Erro ao buscar inscrição:", error);
        }
      })();
    };

    const intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [isPaid, formData.cpf, eventRegister]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      // para não ocorrer do usuário pressionar o Enter ao aplicar o Cupom e ter comportamento do button do form
      event.preventDefault();
    }
  };

  const handleOpenChange = (paymentCreated: boolean) => {
    if (!paymentCreated) {
      setPaymentCreated(null);
    }
  };

  useEffect(() => {
    resetField("installment");
  }, [topValue, cupom, resetField]);

  return (
    <div>
      <FormProvider {...createForm}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="mt-4 flex flex-col gap-2"
        >
          <Button
            variant="outline"
            onClick={() => setOpen(!open)}
            className="cursor-pointer"
            asChild
          >
            <span className="flex w-full items-center justify-between text-foreground">
              Dados pessois do titular do cartão.{" "}
              <ChevronDown
                className={`transition-all duration-200 ${open && "rotate-180"}`}
              />
            </span>
          </Button>

          <div
            className={`overflow-hidden rounded-md border bg-background px-2 py-4 transition-all duration-200 ${open ? "mb-4 h-auto animate-accordion-down" : "pointer-events-none h-0 animate-accordion-up opacity-0 "}`}
          >
            <div
              className={`grid items-center gap-2 rounded-md sm:grid-cols-2`}
            >
              <Fieldset
                isRequired
                legend="Nome Completo"
                className="mt-0 p-0"
                validationMessage={errors.name}
              >
                <Controller
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...register("name")}
                      placeholder="Insira o nome do titular do cartão"
                      value={field.value ?? ""}
                    />
                  )}
                />
              </Fieldset>

              <Fieldset
                isRequired
                className="mt-0 p-0"
                legend="CPF ou CNPJ do titular"
                validationMessage={errors.cpfCnpj}
              >
                <Controller
                  name="cpfCnpj"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      {...register("cpfCnpj")}
                      value={
                        field.value && field.value.length <= 14
                          ? mask(field.value, "999.999.999-99")
                          : (mask(field.value, "99.999.999/9999-99") ?? "")
                      }
                      min={14}
                      max={18}
                      placeholder="000.000.000-00"
                      type="tel"
                    />
                  )}
                />
              </Fieldset>

              <Fieldset
                isRequired
                className="mt-0 p-0"
                legend="E-mail"
                validationMessage={errors.email}
              >
                <Controller
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="email@examplo.com"
                      value={field.value ?? ""}
                    />
                  )}
                />
              </Fieldset>

              <Fieldset
                isRequired
                className="mt-0 p-0"
                legend="Celular"
                validationMessage={errors.mobilePhone}
              >
                <Controller
                  name="mobilePhone"
                  control={control}
                  render={({ field }) => <InputPhone {...field} />}
                />
              </Fieldset>

              <Fieldset
                isRequired
                className="mt-0 p-0"
                legend="CEP"
                validationMessage={errors.postalCode}
              >
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      {...register("postalCode")}
                      value={mask(field.value, "99.999-999") ?? ""}
                      placeholder="00.000-000"
                      type="tel"
                    />
                  )}
                />
              </Fieldset>

              <Fieldset
                isRequired
                className="mt-0 p-0"
                legend="Número da Casa"
                validationMessage={errors.addressNumber}
              >
                <Controller
                  name="addressNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      {...register("addressNumber")}
                      value={field.value ?? ""}
                      type="tel"
                    />
                  )}
                />
              </Fieldset>
            </div>
          </div>
          <Cards
            cvc={data.cvc}
            expiry={data.expiry}
            focused={data.focus}
            name={data.holderName}
            number={data.number.replace(/\s/g, "")}
            placeholders={{ name: "Jhony Richard" }}
            locale={{ valid: "Validade" }}
            acceptedCards={[
              "amex",
              "dinersclub",
              "mastercard",
              "visa",
              "hipercard",
              "elo",
              "discover",
            ]}
            callback={handleCardNumberChange}
          />

          <div className="mt-6 grid items-center gap-2 rounded-md py-3 sm:grid-cols-2">
            <Fieldset
              className="mt-0 p-0"
              isRequired
              legend="Número do Cartão"
              validationMessage={errors.number}
            >
              <Controller
                name="number"
                control={control}
                render={({ field }) => (
                  <Input
                    {...register("number")}
                    {...field}
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e);
                    }}
                    value={mask(field.value, cardMask) ?? ""}
                    placeholder="0000 0000 0000 0000"
                    type="tel"
                  />
                )}
              />
            </Fieldset>
            <Fieldset
              className="mt-0 p-0"
              isRequired
              legend="Nome do Titular"
              validationMessage={errors.holderName}
            >
              <Controller
                name="holderName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...register("holderName")}
                    {...field}
                    onFocus={handleInputFocus}
                    name="holderName"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e);
                    }}
                    value={field.value ?? ""}
                    placeholder="Nome do titular impresso no cartão"
                  />
                )}
              />
            </Fieldset>
            <Fieldset
              isRequired
              className="mt-0 p-0"
              legend="Válido até"
              validationMessage={errors.expiry}
            >
              <Controller
                name="expiry"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setData((prevState) => ({
                        ...prevState,
                        expiry: value,
                      }));
                    }}
                    value={field.value ?? ""}
                    name="expiry"
                  >
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {expiryOptions.map((month, i) => (
                          <SelectItem key={`${month} - ${i}`} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Fieldset>
            <Fieldset
              className="mt-0 p-0"
              isRequired
              legend="CVC"
              validationMessage={errors.cvc}
            >
              <Controller
                name="cvc"
                control={control}
                render={({ field }) => (
                  <Input
                    {...register("cvc")}
                    {...field}
                    name="cvc"
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e);
                    }}
                    value={mask(field.value, cvcMask) ?? ""}
                    maxLength={cardMaxLength}
                    placeholder="123"
                    type="tel"
                  />
                )}
              />
            </Fieldset>
            <Fieldset
              isRequired
              className="col-span-full mt-0 p-0"
              legend="Parcelas"
              validationMessage={errors.installment}
            >
              <Controller
                name="installment"
                control={control}
                render={({ field }) => (
                  <InstallmentSelect onChange={field.onChange} />
                )}
              />
            </Fieldset>

            <div className="col-span-full">
              <PaymentDetail />
            </div>

            <Button
              className="col-span-full mt-4 w-full justify-self-end"
              type="submit"
              size="lg"
              loading={loading === "loading"}
              disabled={isSubmitting}
            >
              Pagar
            </Button>
          </div>
        </form>
      </FormProvider>

      <Dialog open={!!paymentCreated} onOpenChange={handleOpenChange}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Spinner />
              Processando Pagamento
            </DialogTitle>
            <DialogDescription>
              Processando o pagamento da inscrição, aguarde até a aprovação do
              pagamento.
            </DialogDescription>
          </DialogHeader>

          <a target="_blank" href={paymentCreated?.invoiceUrl}>
            Clique para acompanhar o pedido.
          </a>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPaid}
        onOpenChange={(open) => {
          if (!open && isPaid) return;
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
              🎉 Seu pagamento foi realizado com sucesso! 🎉
            </DialogDescription>
          </DialogHeader>
          <div className="flex  items-center gap-2">
            <Ticket className="size-6" />
            <p className="font-semibold">
              Aguarde, estamos preparando seu Ticket...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
