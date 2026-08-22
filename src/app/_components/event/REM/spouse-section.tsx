"use client";

import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../../Fiedset";
import { InputPhone } from "../../ui/input-phone";
import { Input } from "../../ui/input";
import { GridTwoColumns } from "../../grid-two-columns";
import type { RegisterSection } from "@/lib/types";
import { mask, unmask } from "remask";
import { SelectTShirtSize } from "../select-shirt-size";

type SpouseSection = Omit<RegisterSection, "selectOptions"> & {
  hiddenTShirtField?: boolean;
};

export const SpouseSection = ({
  title = "Dados Pessoais da Esposa",
  hiddenTShirtField = false,
  disabled,
  className,
  sectionOnBlur,
  sectionOnFocus,
}: SpouseSection) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <GridTwoColumns
      title={title}
      titleStyle="border-b-8 border-pink-600 w-fit"
      className={className}
    >
      <Fieldset isRequired legend="CPF" validationMessage={errors.spouseCPF}>
        <Controller
          name="spouseCPF"
          render={({ field }) => (
            <Input
              {...field}
              disabled={disabled}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
              value={mask(field.value as string, "999.999.999-99")}
              onChange={(e) => {
                const value = e.target.value;
                const unMask = unmask(value);
                field.onChange(unMask);
              }}
              type="tel"
            />
          )}
        />
      </Fieldset>
      <Fieldset
        isRequired
        legend="Nome Completo"
        validationMessage={errors.spouseName}
      >
        <Controller
          name="spouseName"
          render={({ field }) => (
            <Input
              {...field}
              disabled={disabled}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
              value={field.value ?? ""}
            />
          )}
        />
      </Fieldset>
      <Fieldset
        isRequired
        legend="Email"
        validationMessage={errors.spouseEmail}
      >
        <Input
          {...register("spouseEmail")}
          type="email"
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />

        <p className="bg-primary/10 p-1 text-sm font-semibold text-primary">
          Use um e-mail válido — o formulário do REM será enviado para ele.
        </p>
      </Fieldset>
      <Fieldset
        isRequired
        legend="Celular"
        validationMessage={errors.spousePhoneNumber}
        onFocusCapture={sectionOnFocus}
        onBlurCapture={sectionOnBlur}
      >
        <Controller
          control={control}
          name="spousePhoneNumber"
          render={({ field }) => (
            <InputPhone
              {...field}
              showDisabledDialCodeAndPrefix
              disableDialCodeAndPrefix
              disabled={disabled}
              value={field.value}
            />
          )}
        />
      </Fieldset>
      <Fieldset
        isRequired
        legend="Data de nascimento"
        validationMessage={errors.spouseBirthDate}
      >
        <Controller
          control={control}
          name="spouseBirthDate"
          render={({ field }) => (
            <Input
              {...field}
              value={mask(field.value, "99/99/9999")}
              disabled={disabled}
              placeholder="dd/mm/aaaa"
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
              type="tel"
              maxLength={10}
            />
          )}
        />
      </Fieldset>
      {!hiddenTShirtField && (
        <Fieldset
          legend="Tamanho da Camiseta do Esposa"
          validationMessage={errors.womanTshirtSize}
        >
          <Controller
            control={control}
            name="womanTshirtSize"
            render={({ field }) => (
              <SelectTShirtSize
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value}
                onFocus={sectionOnFocus}
                onBlur={sectionOnBlur}
              />
            )}
          />
        </Fieldset>
      )}
    </GridTwoColumns>
  );
};
