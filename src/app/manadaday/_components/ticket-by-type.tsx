"use client";

import { Input } from "@/app/_components/ui/input";
import { MANADA_DAY } from "../participar/constant";
import { reais } from "@/lib/utils/money";
import { useFormContext } from "react-hook-form";
import { mask } from "remask";
import { type TicketType } from "./stores/ticket-store";
import { type ChangeEvent } from "react";

type TicketByTypeProps = {
  type: TicketType;
  index: number;
};

export const TicketByType = ({ type, index }: TicketByTypeProps) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const errorsAny = errors as any;
  const participantErrors = errorsAny.participants?.[index - 1];
  const nameError = participantErrors?.name?.message;
  const cpfError = participantErrors?.cpf?.message;

  const isCpfRequired = type === "ADULT";

  return (
    <div className="space-y-4 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/60">
            {index}
          </span>
          Ingresso
        </p>
        <p className="text-lg font-bold">| {MANADA_DAY.ticketsType[type]}</p>
      </div>

      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Nome"
            className={`bg-muted `}
            {...register(`participants.${index - 1}.name`)}
          />
          {nameError && (
            <p className="mt-1 text-sm text-destructive">{nameError}</p>
          )}
        </div>
        <div className="flex-1">
          <Input
            placeholder={isCpfRequired ? "CPF *" : "CPF (opcional)"}
            className={`bg-muted`}
            {...register(`participants.${index - 1}.cpf`, {
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const maskedValue = mask(rawValue, "999.999.999-99");
                setValue(`participants.${index - 1}.cpf`, maskedValue);
              },
            })}
          />
          {cpfError && (
            <p className="mt-1 text-sm text-destructive">{cpfError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

type TicketByTypeReportProps = {
  type: TicketType;
  value: number;
  quantity: number;
};

export const TicketByTypeReport = ({
  type,
  value,
  quantity,
}: TicketByTypeReportProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          <b className="pr-1 text-primary">-</b>
          {MANADA_DAY.ticketsType[type]}
        </span>
        <p className="flex items-center gap-2 text-lg text-primary">
          {quantity} {"x"}
          <span className="text-muted-foreground">{reais(value)}</span>
        </p>
      </div>
    </div>
  );
};
