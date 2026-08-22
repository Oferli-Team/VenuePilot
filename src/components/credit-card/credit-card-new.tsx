"use client";
import "react-credit-cards/es/styles-compiled.css";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import cardValidator from "card-validator";
import { CreditCardIcon } from "lucide-react";
import React, { type ChangeEvent, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { mask } from "remask";
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
import { useCupomDesconto } from "../coupon/useCupomDesconto";
import { InstallmentSelect } from "./installment-select";
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
import { InputPhone } from "../ui/input-phone";
import { GridTwoColumns } from "../grid-two-columns";

export const CreditCard = () => {
  const {
    topValue,
    paymentIsLoading,
    chargeAlreadyCreatedAsaas,
    isPaymentCardProcessing,
  } = useCalcValueTopStore();
  const { cupom } = useCupomDesconto();

  const { formData } = useFormStore();

  const initialData = {
    cvc: "",
    expiry: "",
    focus: "",
    holderName: "",
    number: "",
    installment: "",
  };

  const [whoIsPaying, setWhoIsPaying] = React.useState<"owner" | "other">(
    "owner",
  );
  const [cardMask, setCardMask] = React.useState("9999 9999 9999 9999");
  const [cvcMask, setCvcMask] = React.useState("999");
  const [cardMaxLength, setCardMaxLength] = React.useState(16);
  const [data, setData] = React.useState(initialData);

  const {
    formState: { errors },
    control,
    resetField,
  } = useFormContext();

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

  const expiryOptions = generateExpiryOptions();

  useEffect(() => {
    resetField("cc_installment");
  }, [topValue, cupom, resetField]);

  return (
    <div className="space-y-2">
      <GridTwoColumns
        className="mb-4 mt-2 rounded-md border bg-card p-4 sm:mt-4"
        title="Preencha com os dados do titular do cartão"
      >
        <Fieldset
          isRequired
          legend="Nome Completo"
          className="mt-0 p-0"
          validationMessage={errors.cc_name}
        >
          <Controller
            name="cc_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Insira o nome do titular do cartão"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </Fieldset>

        <Fieldset
          isRequired
          className="mt-0 p-0"
          legend="CPF ou CNPJ do titular"
          validationMessage={errors.cc_cpfCnpj}
        >
          <Controller
            name="cc_cpfCnpj"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
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
          validationMessage={errors.cc_email}
        >
          <Controller
            name="cc_email"
            control={control}
            render={({ field }) => (
              <Input
                type="email"
                placeholder="email@examplo.com"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </Fieldset>

        <Fieldset
          isRequired
          className="mt-0 p-0"
          legend="Celular"
          validationMessage={errors.cc_mobilePhone}
        >
          <Controller
            name="cc_mobilePhone"
            control={control}
            render={({ field }) => (
              <InputPhone
                disableDialCodeAndPrefix
                showDisabledDialCodeAndPrefix
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
        </Fieldset>

        <Fieldset
          isRequired
          className="mt-0 p-0"
          legend="CEP"
          validationMessage={errors.cc_postalCode}
        >
          <Controller
            name="cc_postalCode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
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
          validationMessage={errors.cc_addressNumber}
        >
          <Controller
            name="cc_addressNumber"
            control={control}
            render={({ field }) => (
              <Input {...field} value={field.value ?? ""} type="tel" />
            )}
          />
        </Fieldset>
      </GridTwoColumns>
      <GridTwoColumns
        className="rounded-md border bg-card p-4"
        title="Dados do Cartão"
      >
        <Fieldset
          className="mt-0 p-0"
          isRequired
          legend="Número do Cartão"
          validationMessage={errors.cc_number}
        >
          <Controller
            name="cc_number"
            control={control}
            render={({ field }) => (
              <Input
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
          validationMessage={errors.cc_holderName}
        >
          <Controller
            name="cc_holderName"
            control={control}
            render={({ field }) => (
              <Input
                onFocus={handleInputFocus}
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
          validationMessage={errors.cc_expiry}
        >
          <Controller
            name="cc_expiry"
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
                name="cc_expiry"
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
          validationMessage={errors.cc_cvc}
        >
          <Controller
            name="cc_cvc"
            control={control}
            render={({ field }) => (
              <Input
                onFocus={handleInputFocus}
                onChange={(e) => {
                  field.onChange(e);
                  handleInputChange(e);
                }}
                value={mask(field.value, cvcMask) ?? ""}
                maxLength={cardMaxLength}
                placeholder="123"
                type="tel"
                leftIcon={<CreditCardIcon className="size-4" />}
              />
            )}
          />
        </Fieldset>
        <Fieldset
          isRequired
          className="col-span-full mt-0 p-0"
          legend="Selecione as Parcelas"
          validationMessage={errors.cc_installment}
        >
          <Controller
            name="cc_installment"
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
          className="col-span-full mt-4 w-full justify-self-end text-base font-semibold"
          type="submit"
          size="lg"
          loading={paymentIsLoading}
          autoFocus={false}
        >
          Pagar com Cartão
        </Button>
      </GridTwoColumns>

      <Dialog open={isPaymentCardProcessing}>
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

          {!!chargeAlreadyCreatedAsaas && (
            <a target="_blank" href={chargeAlreadyCreatedAsaas?.invoiceUrl}>
              Clique para acompanhar o pedido.
            </a>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
