"use client";

import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../../Fiedset";
import { GridThreeColumns } from "../../grid-three-column";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/selects";
import { InputPhone } from "../../ui/input-phone";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";

type EmergencySection = {
  disabled?: boolean;
  title?: string;
  className?: string;
  selectOptions: { value: string; label: string }[];
  sectionOnFocus?: () => void;
  sectionOnBlur?: () => void;
};

export const EmergencySection = ({
  disabled,
  selectOptions,
  title = "Contato de emergência",
  className,
  sectionOnBlur,
  sectionOnFocus,
}: EmergencySection) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <GridThreeColumns title={title} className={cn(className)}>
      <Fieldset
        isRequired
        legend="Vínculo"
        validationMessage={errors.tipo_vinculo_contato_emergencia}
      >
        <Controller
          name="tipo_vinculo_contato_emergencia"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
              name="tipo_vinculo_contato_emergencia"
              disabled={disabled}
            >
              <SelectTrigger ref={field.ref} onFocus={sectionOnFocus}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={sectionOnBlur}>
                <SelectGroup>
                  {selectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </Fieldset>

      <Fieldset
        isRequired
        legend={`Nome`}
        validationMessage={errors.nome_contato_emergencia}
      >
        <Input
          {...register("nome_contato_emergencia")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>

      <Fieldset
        isRequired
        legend={`Celular`}
        validationMessage={errors.celular_contato_emergencia}
      >
        <Controller
          control={control}
          name="celular_contato_emergencia"
          render={({ field }) => (
            <InputPhone
              {...field}
              disabled={disabled}
              disableDialCodeAndPrefix
              showDisabledDialCodeAndPrefix
              value={field.value ?? ""}
              onChange={field.onChange}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
            />
          )}
        />
      </Fieldset>
    </GridThreeColumns>
  );
};
