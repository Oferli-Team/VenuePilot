import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../../Fiedset";
import { GridTwoColumns } from "../../grid-two-columns";
import { Input } from "../../ui/input";
import { mask, unmask } from "remask";
import type { RegisterSection } from "@/lib/types";
import { InputPhone } from "../../ui/input-phone";
import { SelectTShirtSize } from "../select-shirt-size";

type LegendarySection = Omit<RegisterSection, "selectOptions"> & {
  checkAlreadyExistRegister: (value: string) => void;
  hiddenTShirtField?: boolean;
};

export const LegendarySection = ({
  hiddenTShirtField = false,
  title = "Dados Pessoais do Legendário",
  className,
  sectionOnBlur,
  sectionOnFocus,
  disabled,
  checkAlreadyExistRegister,
}: LegendarySection) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <GridTwoColumns
      title={title}
      titleStyle="border-b-8 border-blue-600 w-fit"
      className={className}
    >
      <Fieldset isRequired legend="CPF" validationMessage={errors.cpf}>
        <Controller
          name="cpf"
          render={({ field }) => (
            <Input
              {...field}
              autoFocus
              disabled={disabled}
              value={mask(field.value as string, "999.999.999-99")}
              type="tel"
              onChange={(e) => {
                const value = e.target.value;
                const unMask = unmask(value);
                field.onChange(unMask);
              }}
              onFocus={sectionOnFocus}
              onBlur={(e) => {
                !!sectionOnBlur && sectionOnBlur();
                void checkAlreadyExistRegister(e.target.value);
              }}
            />
          )}
        />
      </Fieldset>

      <Fieldset
        isRequired
        legend="Número Legendário"
        validationMessage={errors.nrLgnd}
      >
        <Controller
          name="nrLgnd"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
              type="tel"
              disabled={disabled}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                field.onChange(onlyNumbers);
              }}
            />
          )}
        />
      </Fieldset>

      <Fieldset
        isRequired
        legend="Nome Completo"
        validationMessage={errors.nome}
      >
        <Controller
          name="nome"
          render={({ field }) => (
            <Input
              {...field}
              disabled={disabled}
              value={field.value ?? ""}
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
            />
          )}
        />
      </Fieldset>
      <Fieldset isRequired legend="Email" validationMessage={errors.email}>
        <Input
          {...register("email")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
          type="email"
        />

        <p className="bg-primary/10 p-1 text-sm font-semibold text-primary">
          Use um e-mail válido — o formulário do REM será enviado para ele.
        </p>
      </Fieldset>
      <Fieldset
        isRequired
        legend="Celular"
        validationMessage={errors.celular}
        onFocusCapture={sectionOnFocus}
        onBlurCapture={sectionOnBlur}
      >
        <Controller
          control={control}
          name="celular"
          render={({ field }) => (
            <InputPhone
              {...field}
              disabled={disabled}
              disableDialCodeAndPrefix
              showDisabledDialCodeAndPrefix
              value={field.value ?? ""}
            />
          )}
        />
      </Fieldset>
      <Fieldset
        isRequired
        legend="Data de nascimento"
        validationMessage={errors.data_nascimento}
      >
        <Controller
          control={control}
          name="data_nascimento"
          render={({ field }) => (
            <Input
              {...field}
              disabled={disabled}
              value={mask(field.value, "99/99/9999")}
              placeholder="dd/mm/aaaa"
              type="tel"
              onFocus={sectionOnFocus}
              onBlur={sectionOnBlur}
              maxLength={10}
            />
          )}
        />
      </Fieldset>
      {!hiddenTShirtField && (
        <Fieldset
          legend="Tamanho da Camiseta do Esposo"
          validationMessage={errors.manTshirtSize}
        >
          <Controller
            control={control}
            name="manTshirtSize"
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
