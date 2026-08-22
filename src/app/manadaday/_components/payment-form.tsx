"use client";

import { AlertPaymentConfirmedModal } from "@/app/_components/alert-payment-confimed-modal";
import { PixChargeAsaasModal } from "@/app/_components/asaas-pix/pix-charge-asaas-modal";
import Fieldset from "@/app/_components/Fiedset";
import { GridTwoColumns } from "@/app/_components/grid-two-columns";
import { MethodPaymentCheckbox } from "@/app/_components/method-payment-checkbox";
import { PaymentMethods } from "@/app/_components/payment-methods";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { InputPhone } from "@/app/_components/ui/input-phone";
import { Label } from "@/app/_components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { Controller, useFormContext } from "react-hook-form";
import { useTickets } from "./stores/ticket-store";
import { useManadaDayFormData } from "./stores/payer-data";
import React from "react";
import { CupomDesconto } from "@/app/_components/coupon/cupom-desconto";
import { FEATURE_FLAG_SHOW_CREDITCARD } from "@/lib/constants";

const IsLegendaryRadio = () => {
  const {
    formState: { errors },
    control,
    register,
    watch,
  } = useFormContext();

  const isLegendary = watch("isLegendary");

  return (
    <Fieldset
      legend="Você é Legendário?"
      validationMessage={errors.isLegendary}
      className="col-span-full"
    >
      <Controller
        name="isLegendary"
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 font-semibold">
              <RadioGroupItem value="true" />
              <Label>Sim</Label>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <RadioGroupItem value="false" />
              <Label>Não</Label>
            </div>
          </RadioGroup>
        )}
      />

      {!!isLegendary && isLegendary === "true" && (
        <Fieldset
          legend="Número LGND"
          validationMessage={errors.legendaryNumber}
          className="mt-3 w-1/2"
        >
          <Input {...register("legendaryNumber")} type="tel" inputSize="sm" />
        </Fieldset>
      )}
    </Fieldset>
  );
};

export const PayerForm = () => {
  const {
    register,
    formState: { errors },
    control,
    setValue,
  } = useFormContext();

  const { formData } = useManadaDayFormData();

  React.useEffect(() => {
    const validate = {
      shouldValidate: true,
      shouldTouch: true,
    };
    setValue("name", formData?.name ?? "", validate);
    setValue("email", formData?.email ?? "", validate);
    setValue("cpf", formData?.cpf ?? "", validate);
    setValue("isLegendary", formData?.isLegendary);
  }, []);

  return (
    <GridTwoColumns
      title="Quem está comprando os Ingressos"
      className="text-lg"
    >
      <IsLegendaryRadio />

      <Fieldset legend="Nome" validationMessage={errors.name}>
        <Input {...register("name")} />
      </Fieldset>
      <Fieldset legend="CPF" validationMessage={errors.cpf}>
        <Input {...register("cpf")} type="tel" />
      </Fieldset>
      <Fieldset legend="E-mail" validationMessage={errors.email}>
        <Input {...register("email")} />
      </Fieldset>
      <Fieldset legend="Celular" validationMessage={errors.phone}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <InputPhone
              {...field}
              showDisabledDialCodeAndPrefix
              disableDialCodeAndPrefix
            />
          )}
        />
      </Fieldset>

      <p className="col-span-full text-sm font-semibold text-primary">
        A confirmação da compra será enviada no e-mail e whatsApp informado
        aqui!
      </p>
    </GridTwoColumns>
  );
};

export const PaymentForm = () => {
  const { setStep } = useTickets();
  const { formData } = useManadaDayFormData();

  const { setValue } = useFormContext();

  React.useEffect(() => {
    const validate = {
      shouldValidate: true,
      shouldTouch: true,
    };
    setValue("cc_name", formData?.name ?? "", validate);
    setValue("cc_email", formData?.email ?? "", validate);
    setValue("cc_cpfCnpj", formData?.cpf ?? "", validate);
  }, []);

  return (
    <>
      <MethodPaymentCheckbox
        showCreditCard={FEATURE_FLAG_SHOW_CREDITCARD}
        className="md:grid-cols-1"
      />

      <CupomDesconto className="px-2" />

      <PaymentMethods />

      <PixChargeAsaasModal />
      <AlertPaymentConfirmedModal />

      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => setStep("data")}
      >
        Voltar
      </Button>
    </>
  );
};
