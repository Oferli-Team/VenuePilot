import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selects";
import { CurrencyInput } from "react-currency-mask";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type Control,
  Controller,
  type FieldErrors,
  FieldValues,
  type UseFormRegister,
  type Path,
  type PathValue,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { type Inscricao } from "@prisma/client";
import { ENUM_INPUT } from "./inscricao-detail/allFields";
import { Textarea } from "./ui/textarea";
import { mask } from "remask";
import { InputPhone } from "./ui/input-phone";

const isDisableEditClass =
  "pointer-events-none border-transparent ring-0 disabled:opacity-100 px-0 ring-0 focus:border-none bg-transparent focus-visible:ring-transparent [&>svg]:hidden";

interface Option {
  value: string | number;
  label: string;
}

export interface ItemProps<T extends FieldValues> {
  keyLabel?: string;
  label: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  editType?: keyof typeof ENUM_INPUT;
  value?: string | number;
  options?: Option[];
  register?: UseFormRegister<T>;
  control?: Control<T>;
  name: Path<T>;
  errors?: FieldErrors<T>;
  validationRules?: object;
  maskPattern?: string | string[];
  component?: JSX.Element;
}

export const PersonalUserItem = <T extends FieldValues>({
  keyLabel,
  label,
  className,
  isEditing,
  editType = "TEXT",
  value,
  options = [],
  control,
  name,
  errors,
  validationRules = {},
  maskPattern,
  component,
}: ItemProps<T>) => {
  const renderEditableField = () => {
    switch (editType) {
      case ENUM_INPUT.TEXTAREA:
        return (
          <Controller
            control={control}
            name={name}
            rules={validationRules}
            render={({ field }) => (
              <Textarea
                disabled={!isEditing}
                className={`${!isEditing && isDisableEditClass} w-full`}
                {...field}
              />
            )}
          />
        );
      case ENUM_INPUT.SELECT:
        return (
          <Controller
            control={control}
            name={name}
            rules={validationRules}
            defaultValue={value as PathValue<T, Path<T>>}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(val) =>
                  field.onChange(val === "null" ? null : val)
                }
                disabled={!isEditing}
              >
                <SelectTrigger
                  className={`w-full ${!isEditing && isDisableEditClass}`}
                >
                  <SelectValue>
                    {
                      options.find((option) => option.value === field.value)
                        ?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {["null", "Nenhum"].includes(String(option.value))
                        ? "Nenhum"
                        : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case ENUM_INPUT.RADIO:
        return (
          <Controller
            control={control}
            name={name}
            rules={validationRules}
            render={({ field }) =>
              isEditing ? (
                <RadioGroup
                  className="flex h-14 gap-4"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  disabled={!isEditing}
                >
                  {options.map((option, i) => (
                    <label
                      htmlFor={`${name} - ${i}`}
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        id={`${name} - ${i}`}
                        value={option.value}
                      />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <p className="flex h-14 items-center py-2 text-sm">{label}</p>
              )
            }
          />
        );
      case ENUM_INPUT.CURRENCY:
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <CurrencyInput
                value={Number(field.value) || 0}
                onChangeValue={(_, value) => {
                  field.onChange(value);
                }}
                InputElement={
                  <Input className={`${!isEditing && isDisableEditClass}`} />
                }
              />
            )}
          />
        );
      case ENUM_INPUT.PHONE_INTERNATIONAL:
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <InputPhone
                {...field}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
                disabled={!isEditing}
                className={`${!isEditing && isDisableEditClass}`}
              />
            )}
          />
        );
      case ENUM_INPUT.TEXT:
        return (
          <Controller
            control={control}
            name={name}
            rules={validationRules}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                disabled={!isEditing}
                className={`${!isEditing && isDisableEditClass} w-full`}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    maskPattern
                      ? mask(e.target.value, maskPattern)
                      : e.target.value,
                  )
                }
              />
            )}
          />
        );
      case ENUM_INPUT.COMPONENT:
        return <>{component}</>;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 text-sm", className)}>
      {keyLabel && (
        <label className="text-xs font-semibold text-muted-foreground">
          {keyLabel}
        </label>
      )}
      {renderEditableField()}
      {errors && errors[name] && (
        <span className="text-xs text-destructive">
          {(errors[name]?.message as string) ?? ""}
        </span>
      )}
    </div>
  );
};
