import { type FeeRates } from "../types";
import { roundToTwoDecimals } from "./roundToTwoDecimals";

export function calcTopValueWithCardFee(
  topValue: number,
  installment: number,
  fees: FeeRates,
) {
  if (installment < 0 || installment > 12) {
    throw new Error(
      "Número de parcelas inválido. Escolha entre 1 e 12 parcelas.",
    );
  }

  const fee = fees[installment];

  if (fee === undefined) {
    throw new Error(`Taxa não definida para ${installment} parcelas.`);
  }

  const feeValue = roundToTwoDecimals(topValue * (fee / 100));
  const valueWithFee = topValue + feeValue;

  return {
    topValue: roundToTwoDecimals(topValue),
    valueWithFee,
    fee,
    feeValue,
    installment,
  };
}
