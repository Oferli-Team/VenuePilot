"use client";

import { Check, Ticket, TicketIcon } from "lucide-react";
import { TextWithIcon } from "../ui/text-with-icon";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { cn } from "@/lib/utils";
import { useCupomDesconto } from "./useCupomDesconto";
import { toast } from "../ui/use-toast";
import { api } from "@/trpc/react";
import { type Loading } from "@/lib/types";
import React, { useEffect } from "react";
import { useFormStore } from "../participante/useFormStore";

type CupomDescontoProps = {
  className?: string;
};

export const CupomDesconto = ({ className }: CupomDescontoProps) => {
  const { eventRegister } = useFormStore();
  const { discount, setDiscount, calcAmount, topValue, setFee, setMethod } =
    useCalcValueTopStore();

  const {
    showCupomInput,
    setShowInput,
    cupom,
    cupomValue,
    setCupomValue,
    setCupom,
    cupomError,
    setCupomError,
  } = useCupomDesconto();

  const getCouponByCode = api.cupom.getByCodigo.useQuery(
    {
      codigo: cupomValue,
      eventoId: eventRegister?.id,
    },
    {
      enabled: false,
    },
  );

  const [loading, setLoading] = React.useState<Loading>("initial");

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCupomValue(value);
    setCupomError("");
    setDiscount(0);
    setFee(0);
    if (!value) {
      setCupomValue("none");
      setCupom(null);
      setMethod("pix");
    }
  };

  const handleCouponError = (message: string, toastMessage?: string) => {
    setCupomError(message);
    setCupomValue("none");
    setDiscount(0);

    if (toastMessage) {
      toast({
        title: toastMessage,
        variant: "destructive",
      });
    }
    setLoading("initial");
  };

  const checkAndApplyCoupon = async () => {
    setLoading("loading");
    if (!cupomValue || cupomValue.includes("none")) {
      handleCouponError("Informe o código do Cupom");
      return;
    }

    if (cupomValue.length <= 3) {
      handleCouponError("Cupom deve conter mais de 3 caracteres");
      return;
    }

    const { data: _cupom, isError } = await getCouponByCode.refetch();

    if (isError) {
      const toastMessage =
        "Ops! Erro ao buscar o cupom. Tente novamente ou contate o suporte.";
      handleCouponError("Erro ao buscar cupom.", toastMessage);
      return;
    }

    if (!_cupom?.ativo) {
      handleCouponError("Cupom inválido");
      return;
    }

    if (_cupom.quantidade === _cupom?.usadoCount) {
      const toastMessage = "Ops! Código de cupom inválido.";
      handleCouponError("Cupom esgotado.", toastMessage);
      return;
    }

    // se o desconto for de 100% remove a taxa
    if (_cupom?.desconto === 10000) {
      setFee(0);
    }

    const withDiscount = (topValue * (_cupom.desconto / 100)) / 100;
    setDiscount(withDiscount);
    calcAmount();
    setCupomError("");
    toast({
      title: "Eba! Cupom Válido.",
      description: "Desconto aplicado na Inscrição com sucesso!",
      variant: "success",
    });

    setCupom(_cupom);
    setLoading("initial");
  };

  useEffect(() => {
    if (cupom) {
      setCupomValue(cupom.codigo);
      setDiscount((topValue * (cupom.desconto / 100)) / 100);
    }
  }, []);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-2 sm:max-w-max",
        className,
      )}
    >
      <div className="flex flex-col gap-2 ">
        <div className="flex items-center gap-4">
          <TextWithIcon
            icon={<Ticket size={18} />}
            label="Cupom"
            className="justify-start"
          />
          <Switch
            checked={showCupomInput}
            onCheckedChange={() => setShowInput(!showCupomInput)}
          />
        </div>
        <p className="text-xs">
          {showCupomInput &&
            "Insira abaixo um código para obter desconto na sua inscrição."}
        </p>
      </div>

      {showCupomInput && (
        <>
          <div className="mt-4 flex w-full items-center gap-2">
            <Input
              onChange={handleCouponChange}
              value={cupomValue && cupomValue !== "none" ? cupomValue : ""}
              rightIcon={
                <Check
                  className={`mr-2 scale-0 text-success transition-transform delay-75 ${discount > 0 && "scale-100"}`}
                />
              }
            />

            <Button
              variant="secondary"
              type="button"
              onClick={checkAndApplyCoupon}
              loading={loading === "loading"}
              disabled={cupom ? true : false}
            >
              Aplicar
            </Button>
          </div>

          {cupom?.codigo && (
            <p className="flex items-center gap-2 rounded-md border bg-background p-2 text-sm">
              <TicketIcon className="size-4" /> {cupom?.codigo}
            </p>
          )}
          <p className="text-xs text-destructive">{cupomError}</p>
        </>
      )}
    </div>
  );
};
