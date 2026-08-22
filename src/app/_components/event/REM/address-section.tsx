"use client";

import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../../Fiedset";
import { Input } from "../../ui/input";
import { GridThreeColumns } from "../../grid-three-column";
import type { RegisterSection } from "@/lib/types";
import { mask, unmask } from "remask";
import { MASK_PATTERN, URL_CEP_API } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AddressSection = Omit<RegisterSection, "selectOptions">;

export const AddressSection = ({
  title = "Endereço",
  disabled,
  className,
  sectionOnBlur,
  sectionOnFocus,
}: AddressSection) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext();
  return (
    <GridThreeColumns title={title} className={cn(className)}>
      <Fieldset isRequired legend="País" validationMessage={errors.pais}>
        <Input
          {...register("pais")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
      <Fieldset isRequired legend="CEP" validationMessage={errors.cep}>
        <Controller
          control={control}
          name="cep"
          render={({ field }) => (
            <Input
              disabled={disabled}
              type="tel"
              onChange={async (e) => {
                const value = e.target.value;
                const isValid = value.replace(/[-.]/g, "").length === 8;
                field.onChange(unmask(value));
                if (isValid) {
                  const response = await fetch(
                    `${URL_CEP_API}${unmask(value)}/json/`,
                  );
                  const { logradouro, bairro, localidade, uf } =
                    (await response.json()) as {
                      logradouro: string;
                      bairro: string;
                      localidade: string;
                      uf: string;
                    };
                  setValue("rua", logradouro);
                  setValue("bairro", bairro);
                  setValue("cidade", localidade);
                  setValue("estado", uf);
                }
              }}
              value={mask(field.value as string, MASK_PATTERN.cep) ?? ""}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
            />
          )}
        />
      </Fieldset>
      <Fieldset isRequired legend="Estado" validationMessage={errors.estado}>
        <Controller
          name="estado"
          render={({ field }) => (
            <Input
              {...field}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              maxLength={2}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
            />
          )}
        />
      </Fieldset>
      <Fieldset isRequired legend="Cidade" validationMessage={errors.cidade}>
        <Input
          {...register("cidade")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
      <Fieldset isRequired legend="Rua" validationMessage={errors.rua}>
        <Input
          {...register("rua")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
      <Fieldset isRequired legend="Bairro" validationMessage={errors.bairro}>
        <Input
          {...register("bairro")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
      <Fieldset
        isRequired
        legend="Número"
        validationMessage={errors.rua_numero}
      >
        <Input
          {...register("rua_numero")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
          type="tel"
        />
      </Fieldset>
    </GridThreeColumns>
  );
};
