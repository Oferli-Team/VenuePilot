import { useCupomDesconto } from "@/components/coupon/useCupomDesconto";
import { useCalcValueTopStore } from "../store/CalcValueTopStore";

export function useResetDiscountValues() {
  const { setCupom, setCupomValue } = useCupomDesconto();
  const { setDiscount, setFee } = useCalcValueTopStore();

  const resetValues = () => {
    setCupom(null);
    setCupomValue("");
    setDiscount(0);
    setFee(0);
  };

  return { resetValues };
}
