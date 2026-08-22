import { calcTopValueWithCardFee } from "@/lib/utils/calcTopValueWithCardFee";
import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { reais } from "@/lib/utils/money";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { useFormStore } from "../participante/useFormStore";
import { type FeeRates } from "@/lib/types";
import { roundToTwoDecimals } from "@/lib/utils/roundToTwoDecimals";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import { useCupomDesconto } from "../coupon/useCupomDesconto";

type InstallmentSelectProps = {
  onChange: (installment: string) => void;
};

export const InstallmentSelect: React.FC<InstallmentSelectProps> = ({
  onChange,
}) => {
  const { setFee, topValue, discount } = useCalcValueTopStore();
  const { cupom } = useCupomDesconto();
  const { eventRegister } = useFormStore();

  const [selectedValue, setSelectedValue] = useState<string>("");

  const fees = useMemo<FeeRates>(() => {
    if (
      eventRegister?.credit_card_fees &&
      Object.keys(eventRegister.credit_card_fees).length > 0
    ) {
      return eventRegister.credit_card_fees as FeeRates;
    }
    return { 1: 0 }; // default 1x of top value | no fee
  }, [eventRegister]);

  const maxInstallments =
    Object.keys(fees).length > 0
      ? Math.max(...Object.keys(fees).map(Number))
      : 1;

  const installments = useMemo(() => {
    return Array.from({ length: maxInstallments }, (_, i) => {
      const installment = i + 1;
      const valuePay = topValue - discount;
      const result = calcTopValueWithCardFee(valuePay, installment, fees);

      return {
        installment,
        valuePerInstallment: result.valueWithFee / installment,
        feeValue: result.feeValue,
        totalValue: result.valueWithFee,
      };
    });
  }, [topValue, discount, fees, maxInstallments]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    const [installment, valuePerInstallment, feeValue, totalValue] = value
      .split(" - ")
      .map(Number);

    if (feeValue) {
      setFee(feeValue);
    }

    const valuePerInstallmentWithFee = convertToBasisPoint(
      roundToTwoDecimals(Number(valuePerInstallment)),
    );

    const valueTotalWithFee = convertToBasisPoint(Number(totalValue));

    onChange(
      `${installment} - ${valuePerInstallmentWithFee} - ${valueTotalWithFee}`,
    );
  };

  useEffect(() => {
    setSelectedValue("");
  }, [topValue, cupom]);

  const formatSelectedValue = (value: string) => {
    if (!value) return "Selecione";

    const [installment, valuePerInstallment, _, totalValue] = value
      .split(" - ")
      .map(Number);
    const valuePerInstallmentWithFee = roundToTwoDecimals(
      Number(valuePerInstallment),
    );
    return `${installment}x de ${reais(valuePerInstallmentWithFee)} - ${reais(Number(totalValue))}`;
  };

  return (
    <Select onValueChange={handleValueChange} value={selectedValue}>
      <SelectTrigger disabled={!eventRegister}>
        <SelectValue placeholder="Selecione">
          {formatSelectedValue(selectedValue)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {installments.map((item) => (
            <SelectItem
              key={`parcela-${item.installment}`}
              value={`${item.installment} - ${item.valuePerInstallment} - ${item.feeValue} - ${item.totalValue}`}
            >
              {item.installment}x de {reais(item.valuePerInstallment)}{" "}
              <span className="text-primary">({reais(item.totalValue)})</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
