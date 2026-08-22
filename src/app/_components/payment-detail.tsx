import { Minus } from "lucide-react";
import { Separator } from "./ui/separator";
import { reais } from "@/lib/utils/money";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";

export const PaymentDetail = () => {
  const { topValue: value, fee, discount } = useCalcValueTopStore();
  const total = value - discount + fee;

  return (
    <div className="flex w-full flex-col gap-4 rounded-md border p-4">
      <p className="text-xs font-semibold sm:text-sm">Resumo da Cobrança</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm opacity-70">
          <p className="">Inscrição</p>
          {value > 0 && <p>{reais(value)}</p>}
        </div>
        <Separator className="opacity-50" />

        <div className="flex items-center justify-between gap-2 text-sm opacity-70">
          <p className="">Taxa</p>
          <p className="text-destructive">
            {fee > 0 ? `+ ${reais(fee)}` : <Minus size={20} />}
          </p>
        </div>

        <Separator className="opacity-50" />

        <div className="flex items-center justify-between gap-2 text-sm opacity-70">
          <p className="">Cupom</p>
          <p className="text-success">
            {discount > 0 ? `- ${reais(discount)}` : <Minus size={20} />}
          </p>
        </div>

        <Separator className="opacity-50" />

        <div className="flex items-center justify-between gap-2 text-sm font-semibold">
          <p className="">Total a pagar</p>
          <p>{reais(total)}</p>
        </div>
      </div>
    </div>
  );
};
